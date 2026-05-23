import os
import re

directories = [
    '.',
    'assignment-help',
    'contact-us',
    'earn-with-us',
    'technical-solutions',
    'writer-portal'
]

if not os.path.exists('components'):
    os.makedirs('components')

# Extract header and footer from root index.html to save as components
with open('index.html', 'r', encoding='utf-8') as f:
    root_html = f.read()

header_match = re.search(r'<header.*?</header>', root_html, re.DOTALL)
footer_match = re.search(r'<footer.*?</footer>', root_html, re.DOTALL)

if header_match:
    with open('components/header.html', 'w', encoding='utf-8') as f:
        f.write(header_match.group(0))

if footer_match:
    with open('components/footer.html', 'w', encoding='utf-8') as f:
        f.write(footer_match.group(0))

for d in directories:
    index_path = os.path.join(d, 'index.html')
    if not os.path.exists(index_path):
        continue
        
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 1. Extract CSS
    style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
    if style_match:
        css_content = style_match.group(1).strip()
        with open(os.path.join(d, 'style.css'), 'w', encoding='utf-8') as f:
            f.write(css_content)
        content = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="style.css">', content, flags=re.DOTALL)
        
    # 2. Extract Head JS (toggleMenu)
    head_js_match = re.search(r'<script>\s*function toggleMenu\(\).*?</script>', content, re.DOTALL)
    head_js = ""
    if head_js_match:
        head_js = head_js_match.group(0).replace('<script>', '').replace('</script>', '').strip()
        content = content.replace(head_js_match.group(0), '')
        
    # 3. Extract Body JS
    # Sometimes it has email-decode script before it, so be careful.
    # Look for the script block that contains window.addEventListener('scroll'
    body_js_match = re.search(r'<script>(?:\s*document\.querySelectorAll.*?|\s*const header = document\.getElementById.*?</script>|.*?</script>)', content, re.DOTALL)
    
    # In root index.html there is a malformed script
    if d == '.':
        # Fix the root index.html malformed script
        malformed_match = re.search(r'</script>\s*const header = document\.getElementById.*?^        </script>', content, re.DOTALL | re.MULTILINE)
        if malformed_match:
            body_js_content = malformed_match.group(0).replace('</script>', '').strip()
            with open(os.path.join(d, 'script.js'), 'w', encoding='utf-8') as f:
                f.write(head_js + "\n\n" + body_js_content)
            content = content.replace(malformed_match.group(0), '<script src="script.js"></script>')
    else:
        # Standard script block at bottom
        # Let's find the script block that has 'const header' or 'window.addEventListener'
        script_blocks = re.finditer(r'<script>(.*?)</script>', content, re.DOTALL)
        for match in script_blocks:
            if 'window.addEventListener(\'scroll\'' in match.group(1) or 'const header =' in match.group(1):
                body_js_content = match.group(1).strip()
                with open(os.path.join(d, 'script.js'), 'w', encoding='utf-8') as f:
                    f.write(head_js + "\n\n" + body_js_content)
                content = content.replace(match.group(0), '<script src="script.js"></script>')
                break
                
    # 4. Extract Header
    content = re.sub(r'<header.*?</header>', '<div id="header-placeholder"></div>', content, flags=re.DOTALL)
    
    # 5. Extract Footer
    content = re.sub(r'<footer.*?</footer>', '<div id="footer-placeholder"></div>', content, flags=re.DOTALL)
    
    # 6. Add load components script
    load_script = """
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            fetch('/components/header.html')
                .then(res => res.text())
                .then(data => {
                    document.getElementById('header-placeholder').innerHTML = data;
                });
            fetch('/components/footer.html')
                .then(res => res.text())
                .then(data => {
                    document.getElementById('footer-placeholder').innerHTML = data;
                });
        });
    </script>
    """
    # Insert load_script just before </body>
    if "header-placeholder" in content and "load components script" not in content:
         content = content.replace('</body>', load_script + '\n</body>')
         
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Extraction complete.")
