import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

function extractFileName(path: string) {
  // Extract the file name with the extension
  const fileNameWithExtension = path.split('/').pop() || '';

  // Remove the file extension
  const fileNameWithoutExtension = fileNameWithExtension.split('.').slice(0, -1).join('.');

  return fileNameWithoutExtension;
}



export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, what question do you have about eye care?',
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;
  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

//handle form submission
async function handleSubmit(e: any) {
  e.preventDefault();

  setError(null);

  if (!query) {
    alert('Please input a question');
    return;
  }

  const question = query.trim();

  setMessageState((state) => ({
    ...state,
    messages: [
      ...state.messages,
      {
        type: 'userMessage',
        message: question,
      },
    ],
  }));

  setLoading(true);
  setQuery('');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        history,
      }),
    });
    const data = await response.json();
    console.log('data', data);

    if (data.error) {
      setError(data.error);
    } else {
      // Fetch image after receiving the response
      const searchTermsResponse = await fetch('/api/get_search_terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatResponse: data.text,
        }),
      });
      const searchTermsData: { searchTerms?: string } = await searchTermsResponse.json();
      const searchTerms = searchTermsData.searchTerms;
      
      // Fetch image using the search terms
      const imageResponse = await fetch(`/api/fetch_image?query=${encodeURIComponent(searchTerms)}`);
      const imageData: { imageUrl?: string; imageSource?: string } = await imageResponse.json();
      const imageUrl = imageData.imageUrl;
      const imageSource = imageData.imageSource;

      setMessageState((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            type: 'apiMessage',
            message: data.text,
            sourceDocs: data.sourceDocuments,
            imageUrl, // Store the fetched image URL in the message state
            imageSource, // Store the fetched image source in the message state
          },
        ],
        history: [...state.history, [question, data.text]],
      }));
    }
    console.log('messageState', messageState);

    setLoading(false);

    //scroll to bottom
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
  } catch (error) {
    setLoading(false);
    setError('An error occurred while fetching the data. Please try again.');
    console.log('error', error);
  }
}


  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <>
   <Layout>
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Chat With Eye Care Reference Texts
          </h1>
          <main className={styles.main}>
            <div className={styles.cloud}>
              <div ref={messageListRef} className={styles.messagelist}>
                {messages.map((message, index) => {
                  let icon;
                  let className;
                  if (message.type === 'apiMessage') {
                    icon = (
                      <Image
                        key={index}
                        src="/eye.png"
                        alt="AI"
                        width="40"
                        height="40"
                        className={styles.boticon}
                        priority
                      />
                    );
                    className = styles.apimessage;
                  } else {
                    icon = (
                      <Image
                        key={index}
                        src="/usericon.png"
                        alt="Me"
                        width="30"
                        height="30"
                        className={styles.usericon}
                        priority
                      />
                    );
                    className =
                      loading && index === messages.length - 1
                        ? styles.usermessagewaiting
                        : styles.usermessage;
                  }
                  return (
                    <>
                      <div key={`chatMessage-${index}`} className={className}>
                        {icon}
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                    {/* {message.type === 'apiMessage' && message.imageUrl && (
                      <div key={`chatMessageImage-${index}`} className="mx-auto my-2">
                        <img
                          src={message.imageUrl}
                          alt="Image related to the query"
                        />
                        <p className="text-center">
                          Source: <a href={message.imageSource} target="_blank" rel="noopener noreferrer">{message.imageSource}</a>
                        </p>
                      </div>
                    )} */}
                      {message.sourceDocs && (
                        <div
                          className="p-5"
                          key={`sourceDocsAccordion-${index}`}
                        >
                          <Accordion
                            type="single"
                            collapsible
                            className="flex-col"
                          >
                            {message.sourceDocs.map((doc, index) => (
                              <div key={`messageSourceDocs-${index}`}>
                                <AccordionItem value={`item-${index}`}>
                                  <AccordionTrigger>
                                    <h3>Source {index + 1}</h3>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ReactMarkdown linkTarget="_blank">
                                      {doc.pageContent}
                                    </ReactMarkdown>
                                    <p className="mt-2">
                                      <b>Source:</b> {extractFileName(doc.metadata.source)}
                                    </p>
                                  </AccordionContent>
                                </AccordionItem>
                              </div>
                            ))}
                          </Accordion>
                        </div>
                      )}

                    </>
                  );
                })}
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                  <textarea
                    disabled={loading}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={2000}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      loading
                        ? 'Waiting for response...'
                        : 'How do I treat a corneal abrasion?'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.textarea}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.generatebutton}
                  >
                    {loading ? (
                      <div className={styles.loadingwheel}>
                        <LoadingDots color="#000" />
                      </div>
                    ) : (
                      <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </main>
        </div>
        <footer className="m-auto p-4">
          <a>
            Powered by GPT-4 and LangChainAI | Built by Mac Singer, MD
          {/* <br></br>
            Built by <a href="https://www.linkedin.com/in/mac-singer-a11908111/"> Mac Singer, MD </a> */}
          </a>
        </footer>
      </Layout>
    </>
  );
}

