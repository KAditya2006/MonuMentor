const fs = require('fs');

async function getWikiUrl(filename) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&titles=File:${encodeURIComponent(filename)}&format=json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];
    return page.imageinfo ? page.imageinfo[0].url : "Not found";
  } catch (err) {
    return "Error";
  }
}

async function run() {
  const urls = {
    taj: await getWikiUrl("Taj_Mahal_2012.jpg"),
    meenakshi: await getWikiUrl("Meenakshi_Amman_West_Tower.jpg"),
    hawa: await getWikiUrl("Hawa_Mahal_2006.jpg"),
    amber: await getWikiUrl("Amber_Fort_Jaipur_1.jpg")
  };
  fs.writeFileSync('urls.json', JSON.stringify(urls, null, 2));
}
run();
