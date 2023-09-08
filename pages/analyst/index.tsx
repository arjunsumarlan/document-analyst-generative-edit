import { useRef, useState, useEffect, Fragment } from 'react';
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

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [isFileUploaded, setFileUploadedState] = useState<boolean>(false);
  const [isUploading, setUploadingState] = useState<boolean>(false);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [],
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
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const file = e.target.files[0];
    if (!file) {
        setFileUploadError('File is not provided.');
    }

    const form = new FormData();
    form.append('pdfFile', file);

    try {
        setUploadingState(true);
        const response = await fetch('/api/pdf', {
            method: 'POST',
            body: form,
        });

        if (!response.ok) {
            const data = await response.json();
            setFileUploadError(data.error);
        } else {
            await response.json();
            setFilename(file.name);
            setUploadingState(false);
            setFileUploadedState(true);
            setFileUploadError(null);
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        setFileUploadError('An error occurred while uploading the file.');
    }
  };

  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Legal Document Analyst
          </h1>
          <main className={styles.main}>
            <div className={styles.cloud}>
              <div ref={messageListRef} className={styles.messagelist}>
                <div className={styles.apimessage}>
                    <Image
                        src="/logo.png"
                        alt="AI"
                        width="30"
                        height="30"
                        className={styles.boticon}
                        priority
                    />
                    <div className={styles.markdownanswer}>
                        <ReactMarkdown linkTarget="_blank">
                            Silakan upload dokumen Anda
                        </ReactMarkdown>
                     </div>
                </div>
                {
                    !isFileUploaded && !isUploading ?
                        <div className="p-3">
                            <input type="file" accept=".pdf" onChange={handleFileChange} />
                            {fileUploadError && <p className="text-red-500">{fileUploadError}</p>}
                        </div>
                        : isUploading ?
                            <div className={styles.usermessage}>
                                <Image
                                    src="/usericon.png"
                                    alt="ME"
                                    width="30"
                                    height="30"
                                    className={styles.usericon}
                                    priority
                                />
                                <div className={styles.markdownanswer}>
                                    File Uploading {' '}<LoadingDots color="#000" />
                                </div>
                            </div>
                            :
                            
                            <div className={styles.usermessage}>
                                <Image
                                    src="/usericon.png"
                                    alt="ME"
                                    width="30"
                                    height="30"
                                    className={styles.usericon}
                                    priority
                                />
                                <div className={styles.markdownanswer}>
                                    <ReactMarkdown linkTarget="_blank">
                                        {`File Uploaded : ${filename}`}
                                    </ReactMarkdown>
                                </div>
                            </div>
                }
                {
                    isFileUploaded &&
                    <div className={styles.apimessage}>
                        <Image
                            src="/logo.png"
                            alt="AI"
                            width="30"
                            height="30"
                            className={styles.boticon}
                            priority
                        />
                        <div className={styles.markdownanswer}>
                            <ReactMarkdown linkTarget="_blank">
                                Halo, apa yang ingin Anda ketahui tentang dokumen ini?
                            </ReactMarkdown>
                        </div>
                    </div>
                }
                {messages.map((message, index) => {
                  let icon;
                  let className;
                  if (message.type === 'apiMessage') {
                    icon = (
                      <Image
                        key={index}
                        src="/logo.png"
                        alt="AI"
                        width="30"
                        height="30"
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
                    // The latest message sent by the user will be animated while waiting for a response
                    className =
                      loading && index === messages.length - 1
                        ? styles.usermessagewaiting
                        : styles.usermessage;
                  }
                  return (
                    <Fragment key={index}>
                      <div key={`chatMessage-${index}`} className={className}>
                        {icon}
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                      {message.sourceDocs && (
                        <div
                          className="p-5 bg-[#f4f6f8]"
                          key={`sourceDocsAccordion-${index}`}
                        >
                          <Accordion
                            type="single"
                            collapsible
                            className="flex-col"
                          >
                            {message.sourceDocs.slice(0, 1).map((doc, index) => (
                              <div key={`messageSourceDocs-${index}`}>
                                <AccordionItem value={`item-${index}`}>
                                  <AccordionTrigger>
                                    <h3>Reference</h3>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ReactMarkdown linkTarget="_blank">
                                      {doc.pageContent}
                                    </ReactMarkdown>
                                    <p className="mt-2">
                                      <b>Dokumen:</b> {doc.metadata.source}
                                    </p>
                                  </AccordionContent>
                                </AccordionItem>
                              </div>
                            ))}
                          </Accordion>
                        </div>
                      )}
                    </Fragment>
                  );
                })}
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                  <textarea
                    disabled={loading || !isFileUploaded}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={512}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      loading
                        ? 'Menunggu respon...'
                        : 'Silakan masukkan pertanyaan Anda'
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
                      // Send icon SVG in input field
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
      </Layout>
    </>
  );
}
