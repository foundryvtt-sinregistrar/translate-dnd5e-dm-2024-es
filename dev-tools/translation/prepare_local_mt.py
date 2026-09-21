"""Download official OPUS-MT weights and prepare a local CPU translator.

Only model files are downloaded; translation source text never leaves this host.
https://huggingface.co/Helsinki-NLP/opus-mt-en-es
https://opennmt.net/CTranslate2/guides/opus_mt.html
"""
import hashlib
import json
import sys
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT/'tmp/translation-runtime'))
URL = 'https://object.pouta.csc.fi/Tatoeba-MT-models/eng-spa/opus-2021-02-19.zip'
def main():
    model = ROOT/'tmp/opus-en-es'
    model.mkdir(parents=True, exist_ok=True)
    archive = model/'opus-2021-02-19.zip'
    if not archive.exists():
        print('Downloading official OPUS-MT English-Spanish weights', flush=True)
        urllib.request.urlretrieve(URL, archive)
    with zipfile.ZipFile(archive) as package:
        for name in package.namelist():
            target = (model/name).resolve()
            if not target.is_relative_to(model.resolve()): raise ValueError('Unsafe archive member')
        package.extractall(model)
    import ctranslate2
    if not (model/'ct2/model.bin').exists():
        ctranslate2.converters.OpusMTConverter(str(model)).convert(str(model/'ct2'), quantization='int8')
    metadata = {'url':URL, 'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(), 'ctranslate2':ctranslate2.__version__}
    (model/'provenance.json').write_text(json.dumps(metadata, indent=2), encoding='utf8')
    print(json.dumps(metadata), flush=True)
if __name__ == '__main__': main()
