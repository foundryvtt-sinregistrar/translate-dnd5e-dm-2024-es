"""Cache local reference PDFs as per-page OCR text and compressed TSV.

Run from any directory. Requires PyMuPDF and a local Tesseract installation.
PDFs and generated OCR remain inside the ignored export/data directory.
"""
import csv
import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tmp/pdf-runtime'))
import pymupdf

DATA = ROOT / 'dev-tools/export/data'
OUTPUT = DATA / 'ocr'
TESSERACT = Path('C:/Program Files/Tesseract-OCR/tesseract.exe')
TESSDATA = ROOT / 'tmp/tessdata'
DPI = 300
WORKERS = 4


def sha256(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def save_json(path, value):
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temp.replace(path)


def process_page(task):
    filename, language, number, signature = task
    folder = OUTPUT / language / 'pages'
    folder.mkdir(parents=True, exist_ok=True)
    base = folder / f'{number:04d}'
    meta_path = base.with_suffix('.json')
    if meta_path.exists() and base.with_suffix('.txt').exists() and base.with_suffix('.tsv.gz').exists():
        old = json.loads(meta_path.read_text(encoding='utf-8'))
        if old.get('signature') == signature:
            return old, True
    scratch = ROOT / 'tmp/ocr-pages'
    scratch.mkdir(parents=True, exist_ok=True)
    image = scratch / f'{language}-{number:04d}.png'
    tsv_path = base.with_suffix('.tsv')
    started = time.monotonic()
    try:
        with pymupdf.open(filename) as pdf:
            page = pdf[number - 1]
            native = page.get_text(sort=True)
            pix = page.get_pixmap(dpi=DPI, colorspace=pymupdf.csRGB, alpha=False)
            width, height = pix.width, pix.height
            pix.save(image)
        result = subprocess.run(
            [str(TESSERACT), str(image), str(base), '--tessdata-dir', str(TESSDATA),
             '-l', 'eng' if language == 'en' else 'spa', '--psm', '3',
             '-c', 'tessedit_create_txt=1', '-c', 'tessedit_create_tsv=1'],
            capture_output=True, env={**os.environ, 'OMP_THREAD_LIMIT': '1'}, timeout=240,
        )
        if result.returncode:
            raise RuntimeError(result.stderr.decode('utf-8', errors='replace'))
        text = base.with_suffix('.txt').read_text(encoding='utf-8')
        tsv = tsv_path.read_text(encoding='utf-8')
        rows = list(csv.DictReader(io.StringIO(tsv), delimiter='\t', quoting=csv.QUOTE_NONE))
        confidence = [float(r['conf']) for r in rows if r.get('text', '').strip() and float(r['conf']) >= 0]
        with gzip.open(base.with_suffix('.tsv.gz'), 'wt', encoding='utf-8', newline='') as stream:
            stream.write(tsv)
        record = {
            'pdf_page': number, 'signature': signature, 'method': 'tesseract-ocr',
            'language': language, 'dpi': DPI, 'image_width': width, 'image_height': height,
            'native_characters': len(native.strip()), 'characters': len(text.strip()),
            'words': len(confidence),
            'mean_confidence': round(sum(confidence) / len(confidence), 2) if confidence else None,
            'low_confidence_words': sum(c < 60 for c in confidence),
            'seconds': round(time.monotonic() - started, 2),
            'warning': result.stderr.decode('utf-8', errors='replace').strip(),
        }
        save_json(meta_path, record)
        return record, False
    finally:
        image.unlink(missing_ok=True)
        tsv_path.unlink(missing_ok=True)


def main():
    OUTPUT.mkdir(exist_ok=True)
    engine = subprocess.check_output([str(TESSERACT), '--version']).decode('utf-8').splitlines()[0]
    reports = []
    for language in ['en', 'es']:
        source = DATA / f'DnD5e-2024-dm-{language}.pdf'
        with pymupdf.open(source) as pdf:
            count = len(pdf)
        model = 'eng' if language == 'en' else 'spa'
        config = {'pdf_sha256': sha256(source), 'engine': engine, 'pymupdf': pymupdf.VersionBind,
                  'model_sha256': sha256(TESSDATA / f'{model}.traineddata'), 'dpi': DPI, 'psm': 3}
        signature = hashlib.sha256(json.dumps(config, sort_keys=True).encode()).hexdigest()
        report = {'source': source.name, 'language': language, 'page_count': count,
                  'config': config, 'started_utc': datetime.now(timezone.utc).isoformat()}
        folder = OUTPUT / language
        folder.mkdir(exist_ok=True)
        records, errors = [], []
        reused_pages = 0
        print(f'{language}: {count} pages; OCR cache {folder}', flush=True)
        with ProcessPoolExecutor(max_workers=WORKERS) as pool:
            pending = {pool.submit(process_page, (str(source), language, n, signature)): n for n in range(1, count + 1)}
            for future in as_completed(pending):
                try:
                    record, cached = future.result()
                    records.append(record)
                    reused_pages += int(cached)
                    if len(records) % 10 == 0 or len(records) == count:
                        print(f'{language}: {len(records)}/{count} pages complete', flush=True)
                except Exception as exc:
                    errors.append({'pdf_page': pending[future], 'error': str(exc)})
                    print(f'{language}: page {pending[future]} ERROR: {exc}', flush=True)
        records.sort(key=lambda r: r['pdf_page'])
        with (folder/'text.txt').open('w', encoding='utf-8') as full, (folder/'pages.jsonl').open('w', encoding='utf-8') as jsonl:
            for record in records:
                n = record['pdf_page']
                text = (folder/'pages'/f'{n:04d}.txt').read_text(encoding='utf-8')
                full.write(f'\n\n===== PDF PAGE {n:04d} =====\n\n{text}')
                jsonl.write(json.dumps({**record, 'text': text}, ensure_ascii=False)+'\n')
        report.update({'completed_pages': len(records), 'reused_pages': reused_pages, 'errors': errors,
                       'status': 'complete' if len(records) == count and not errors else 'incomplete',
                       'finished_utc': datetime.now(timezone.utc).isoformat(),
                       'warning_pages': [r['pdf_page'] for r in records if r['warning']],
                       'review_pages': [r['pdf_page'] for r in records if r['words'] < 20 or (r['mean_confidence'] or 0) < 75 or r['warning']]})
        save_json(folder/'manifest.json', report)
        reports.append(report)
    save_json(OUTPUT/'manifest.json', reports)
    print('FINISHED: '+', '.join(f"{r['language']} {r['completed_pages']}/{r['page_count']}" for r in reports), flush=True)
    return int(any(r['status'] != 'complete' for r in reports))


if __name__ == '__main__':
    raise SystemExit(main())
