import requests

url = "https://pmc.ncbi.nlm.nih.gov/articles/PMC10066192/"

response = requests.get(
    url,
    headers={
        "User-Agent": "Mozilla/5.0"
    }
)

print("Status:", response.status_code)

text = response.text

start = text.find("<title>")
end = text.find("</title>")

print("\nTITLE:\n")

if start != -1 and end != -1:
    print(text[start+7:end])
else:
    print("No title found")
