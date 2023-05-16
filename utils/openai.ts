// import axios from 'axios';

// export async function getSearchTerms(chatResponse: string): Promise<string> {
//   try {
//     const response = await axios.post(
//       'https://api.openai.com/v1',
//       {
//         model: options.model || "gpt-4",
//         prompt: `You are given a prompt answering a question related to eye care. From that prompt extract search terms for a google image search that would be most relevant to the prompt: ${chatResponse}`,
//         temperature: 0,
//         max_tokens: 4096,
//         top_p: 1,
//         frequency_penalty: 0,
//         presence_penalty: 0,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         },
//       }
//     );

//     return response.data.choices[0].text.trim();
//   } catch (error) {
//     console.error('Error fetching search terms:', error);
//     throw error;
//   }
// }
