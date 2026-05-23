import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace style block
content = re.sub(
    r'<style>.*?</style>',
    '<link rel="stylesheet" href="style.css">',
    content,
    flags=re.DOTALL
)

# Remove the first small script block
content = re.sub(
    r'<script>\s*function toggleMenu\(\) \{.*?</script>',
    '',
    content,
    flags=re.DOTALL
)

# Replace the second malformed script block
content = re.sub(
    r'</script>\s*const header = document\.getElementById.*?^        </script>',
    '<script src="script.js"></script>',
    content,
    flags=re.DOTALL | re.MULTILINE
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
