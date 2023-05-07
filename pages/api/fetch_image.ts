// pages/api/fetch_image.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query.query;

  if (!query || typeof query !== 'string') {
    res.status(400).json({ error: 'Invalid search query' });
    return;
  }

  try {
    const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: {
        key: process.env.GOOGLE_API_KEY,
        cx: process.env.CUSTOM_SEARCH_ENGINE_ID,
        searchType: 'image',
        q: query,
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      const imageUrl = response.data.items[0].link;
      const imageSource = response.data.items[0].image.contextLink;
      const urlScheme = imageUrl.split(':')[0];
    
      if (urlScheme === 'http' || urlScheme === 'https') {
        res.status(200).json({ imageUrl, imageSource });
      } else {
        res.status(404).json({ error: 'Invalid image URL scheme' });
      }
    } else {
      res.status(404).json({ error: 'No image found' });
    }
  } catch (error: any) {
    console.error('Error fetching image:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    }
    res.status(500).json({ error: 'Error fetching image' });
  }
};

export default handler;
