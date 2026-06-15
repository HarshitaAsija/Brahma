from scrapling import Fetcher

url = "https://pmc.ncbi.nlm.nih.gov/articles/PMC10066192/"

fetcher = Fetcher()
page = fetcher.get(url)

print("Status:", page.status)
print()

print("html_content length:", len(page.html_content))
print()

print(page.html_content[:500])
