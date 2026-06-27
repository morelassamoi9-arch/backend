import pdfplumber

pdf_path = "FICHE DE RECUEIL N°1  Carte Nationale d'Identité (CNI).pdf"
output_path = "fiche_recueil_text.txt"

print("Starting PDF extraction...")
try:
    with pdfplumber.open(pdf_path) as pdf:
        text_content = []
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                text_content.append(f"--- PAGE {i+1} ---\n{text}\n")
            print(f"Extracted page {i+1}/{len(pdf.pages)}")
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(text_content))
    print(f"Extraction complete! Saved to {output_path}")
except Exception as e:
    print(f"Error occurred: {e}")
