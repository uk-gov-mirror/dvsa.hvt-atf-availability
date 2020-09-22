import express, { Router } from 'express';
import { file, imageFile, fontFile } from '../controllers/asset.controller';

const assetRoute: Router = express.Router();

assetRoute.get('/assets/:asset', file);
assetRoute.get('/assets/images/:asset', imageFile);
assetRoute.get('/assets/fonts/:asset', fontFile);

export default assetRoute;
