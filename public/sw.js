for (const asset of ASSETS) {
  try {
    await cache.add(asset);
  } catch (err) {
    console.warn(`Falha ao armazenar: ${asset}`, err);
  }
}
