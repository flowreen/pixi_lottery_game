import * as PIXI from 'pixi.js';

// Class used to handle loading of assets.
export default class AssetsLoader
{
  assetRoot;
  assetType;

  // Loaded asset list.
  loadedAssets = {};

  // Load progress.
  loadProgress = [];

  constructor(asserRoot, assetType)
  {
    this.assetRoot = asserRoot;
    this.assetType = assetType;
  }

  async loadAssets(assets)
  {

    assets.forEach(assetList =>
    {
      // Go through asset list.
      for (const assetKey in assetList)
      {
        const objValue = assetList[assetKey];

        for (const innerKey in objValue)
        {
          this.loadProgress.push(this.loadSingleAsset(objValue[innerKey]));
        }
      }
    });


    // Wait for all assets to load.
    return Promise.all(this.loadProgress).then(() =>
    {
      // Pass loaded assets.
      return this.loadedAssets;
    });
  }

  async loadSingleAsset(assetLoad)
  {
    return PIXI.Assets.load(this.assetRoot + assetLoad + this.assetType).then((loadedAsset) =>
    {
      // Assign asset to our list.
      this.loadedAssets[assetLoad] = loadedAsset;
    });
  }
}
