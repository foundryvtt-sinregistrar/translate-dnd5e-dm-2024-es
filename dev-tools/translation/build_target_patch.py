"""Package the verified ravanno 6.0.3 fix; never modify the installed dependency."""
import difflib
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
EXPECTED = {
    'lang/es.json': ('ravanno-es-before-target-labels-fd77438f938d.json',
                     'fd77438f938d9a2ceb67ab1c64b181b1d7e6332a5c0892cf6e9f0c4dfb274271'),
    'babele-register.js': ('ravanno-babele-register-before-grammar-f03ce444bac1.js',
                          'f03ce444bac13d076c2bf19abd7a7c398fe45495822eb679af53aa7b9f35d100')
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    dependency = ROOT.parent / 'ravanno-dnd5e-es'
    manifest = json.loads((dependency / 'module.json').read_bytes())
    if (manifest['id'], manifest['version']) != ('ravanno-dnd5e-es', '6.0.3'):
        raise ValueError('This bundle is only for ravanno-dnd5e-es 6.0.3')
    adapter = 'target-labels-es-6.0.3.mjs'
    before, after, patch = {}, {}, []
    for name, (backup, expected) in EXPECTED.items():
        raw = (ROOT / 'tmp' / backup).read_bytes()
        if sha(raw) != expected:
            raise ValueError(f'Unexpected backup: {backup}')
        before[name] = raw.decode('utf-8').replace('\r\n', '\n')
        after[name] = (dependency / name).read_text(encoding='utf-8')
    new_es = json.loads(after['lang/es.json'])
    expected_es = json.loads(before['lang/es.json'])
    for key, value in json.loads((HERE / 'target-labels-6.0.3.patch.json').read_bytes()).items():
        target = expected_es
        remaining = key
        # Foundry dictionaries may mix dotted keys and nested objects.
        while remaining not in target:
            prefix = max((part for part in target if remaining.startswith(part+'.')), key=len)
            target = target[prefix]
            remaining = remaining[len(prefix)+1:]
        target[remaining] = value
    if new_es != expected_es:
        raise ValueError('Installed dictionary contains unrelated changes')
    if after['babele-register.js'] != f'import "./{adapter}";\n' + before['babele-register.js']:
        raise ValueError('Installed registration contains unrelated changes')
    after[adapter] = (HERE / adapter).read_text(encoding='utf-8')
    if after[adapter] != (dependency / adapter).read_text(encoding='utf-8'):
        raise ValueError('Installed adapter differs from reviewed source')
    for name in after:
        patch.extend(difflib.unified_diff(before.get(name, '').splitlines(True),
                     after[name].splitlines(True), fromfile=f'a/{name}' if name in before else '/dev/null',
                     tofile=f'b/{name}'))
    patch_bytes = ''.join(patch).encode('utf-8')
    # Use git apply on a disposable copy. Existing files are reversed exactly;
    # the added adapter must disappear. No installed files are touched.
    with tempfile.TemporaryDirectory(prefix='ravanno-patch-') as temporary:
        trial = Path(temporary)
        for name, text in before.items():
            target = trial / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(text.encode('utf-8'))
        patch_path = trial / 'target-labels.patch'
        patch_path.write_bytes(patch_bytes)
        def git(*args):
            subprocess.run(['git', '-c', 'core.autocrlf=false', 'apply', *args, str(patch_path)],
                           cwd=trial, check=True, capture_output=True)
        git('--check')
        git()
        for name, text in after.items():
            if (trial / name).read_bytes() != text.encode('utf-8'):
                raise ValueError(f'Applied result differs: {name}')
        git('--reverse', '--check')
        git('--reverse')
        if (trial / adapter).exists():
            raise ValueError('Adapter still present after reversal')
        for name, text in before.items():
            if (trial / name).read_bytes() != text.encode('utf-8'):
                raise ValueError(f'Reversal differs: {name}')
    output = ROOT / 'dist' / 'ravanno-target-labels-6.0.3'
    output.mkdir(parents=True, exist_ok=True)
    (output / 'target-labels.patch').write_bytes(patch_bytes)
    shutil.copyfile(HERE / 'PARCHE-IDIOMA.md', output / 'README.md')
    shutil.copyfile(dependency / 'LICENSE', output / 'LICENSE-ravanno.txt')
    shutil.copyfile(ROOT / 'LICENSE.md', output / 'LICENSE-contributions.md')
    evidence = {'dependency': 'ravanno-dnd5e-es', 'version': '6.0.3',
                'checks': ['apply-check', 'apply-content', 'reverse-check', 'reverse-content'],
                'status': 'passed', 'patchSha256': sha(patch_bytes),
                'normalizedBefore': {name: sha(text.encode('utf-8')) for name, text in before.items()},
                'normalizedAfter': {name: sha(text.encode('utf-8')) for name, text in after.items()}}
    (output / 'validation.json').write_text(json.dumps(evidence, indent=2)+'\n', encoding='utf-8')
    members = ['target-labels.patch', 'README.md', 'LICENSE-ravanno.txt', 'LICENSE-contributions.md', 'validation.json']
    checksums = ''.join(f'{sha((output / name).read_bytes())}  {name}\n' for name in members)
    (output / 'SHA256SUMS.txt').write_text(checksums, encoding='utf-8')
    archive = Path(str(output) + '.zip')
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
        for name in members + ['SHA256SUMS.txt']:
            bundle.write(output / name, name)
    print(f'PASS: apply and reverse verified; bundle: {archive}')
    print(f'SHA256: {sha(archive.read_bytes())}')


if __name__ == '__main__':
    main()
