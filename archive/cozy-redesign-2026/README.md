# Cozy notebook redesign (archived)

Open index.html via a local server from repo root so assets resolve:

  cd /path/to/DotItDownWebsite
  python3 -m http.server 8765

Then visit http://localhost:8765/archive/cozy-redesign-2026/

Videos and favicon use ../../assets/ and ../../favicon.png — patch paths if opening standalone.
