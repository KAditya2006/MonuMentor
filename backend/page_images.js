const fs = require('fs');

async function getArticleImage(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&pithumbsize=800&titles=${encodeURIComponent(title)}&format=json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];
    return page.thumbnail ? page.thumbnail.source : "Not found";
  } catch (err) {
    return "Error";
  }
}

async function run() {
  const urls = {
    meenakshi: await getArticleImage("Meenakshi Temple"),
    hawa: await getArticleImage("Hawa Mahal")
  };
  fs.writeFileSync('urls2.json', JSON.stringify(urls, null, 2));
}
run();
