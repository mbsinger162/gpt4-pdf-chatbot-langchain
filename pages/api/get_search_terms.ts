// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getSearchTerms } from '@/utils/openai';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { chatResponse } = req.body;

//   try {
//     const searchTerms = await getSearchTerms(chatResponse);
//     res.status(200).json({ searchTerms });
//   } catch (error) {
//     console.error('Error fetching search terms:', error);
//     res.status(500).json({ error: 'Failed to fetch search terms' });
//   }
// }