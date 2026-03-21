async function getWikiUrl(filename) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&titles=File:${encodeURIComponent(filename)}&format=json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];
    if (page.imageinfo) {
      console.log(filename + " -> " + page.imageinfo[0].url);
    } else {
      console.log(filename + " -> Not found");
    }
  } catch (err) {
    console.error("Error for " + filename, err);
  }
}

async function run() {
  await getWikiUrl("Taj_Mahal_2012.jpg");
  await getWikiUrl("Meenakshi_Amman_West_Tower.jpg");
  await getWikiUrl("Hawa_Mahal_2006.jpg");
  await getWikiUrl("Amber_Fort_Jaipur_1.jpg");
}
run();
