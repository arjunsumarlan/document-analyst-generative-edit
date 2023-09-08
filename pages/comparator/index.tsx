import { useState } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Change } from 'diff';

export default function Comparator() {
  const [comparasionData, setComparasionData] = useState<Change[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [fileOriginal, setFileOriginal] = useState(null);
  const [fileOriginalUploadError, setFileOriginalUploadError] = useState<
    string | null
  >(null);
  const [filenameOriginal, setFilenameOriginal] = useState<string>('');
  const [isFileOriginalUploaded, setFileOriginalUploadedState] =
    useState<boolean>(false);

  const [fileCompare, setFileCompare] = useState(null);
  const [fileCompareUploadError, setFileCompareUploadError] = useState<
    string | null
  >(null);
  const [filenameCompare, setFilenameCompare] = useState<string>('');
  const [isFileCompareUploaded, setFileCompareUploadedState] =
    useState<boolean>(false);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!(fileOriginal && fileCompare)) {
      alert('Please upload your both file original and compare');
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append('pdfFileOriginal', fileOriginal, filenameOriginal);
      form.append('pdfFileCompare', fileCompare, filenameCompare);

      const response = await fetch('/api/compare', {
        method: 'POST',
        body: form,
      });

      const data = await response.json();
      console.log(data);

      if (data.error) {
        setError(data.error);
        setLoading(false);
      } else {
        setComparasionData(data);
        setLoading(false);
      }
      // if (response.ok) {
      //   const blob = await response.blob();
      //   const url = window.URL.createObjectURL(blob);
      //   const a = document.createElement('a');
      //   a.href = url;
      //   a.download = `${filenameOriginal}-changes.pdf`;
      //   a.click();
      //   window.URL.revokeObjectURL(url);

      //   setLoading(false);
      // } else {
      //   setLoading(false);
      //   const data = await response.json();
      //   setError(data.error);
      //   console.log('error', error);
      // }
    } catch (error) {
      setLoading(false);
      setError(
        'An error occurred while fetching the data. Please try again....',
      );
      console.log('error', error);
    }
  }

  const handleFileOriginalChange = async (
    e: React.ChangeEvent<HTMLInputElement> | any,
  ) => {
    const file = e.target.files[0];
    if (!file) {
      setFileOriginalUploadError('File is not provided.');
    }

    setFileOriginal(file);
    setFilenameOriginal(file.name);
    setFileOriginalUploadedState(true);
    setFileOriginalUploadError(null);
  };

  const handleFileCompareChange = async (
    e: React.ChangeEvent<HTMLInputElement> | any,
  ) => {
    const file = e.target.files[0];
    if (!file) {
      setFileCompareUploadError('File is not provided.');
    }

    setFileCompare(file);
    setFilenameCompare(file.name);
    setFileCompareUploadedState(true);
    setFileCompareUploadError(null);
  };

  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Legal Document Comparator
          </h1>
          <main className={`${styles.maincom} p-10`}>
            <div className={`${styles.cloudcom}`}>
              <div className={styles.messagelist}>
                <div className={styles.usermessage}>
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
                    {!isFileOriginalUploaded && !loading ? (
                      <div className="pt-5">
                        <input
                          type="file"
                          id="fileInputOri"
                          accept=".pdf"
                          onChange={handleFileOriginalChange}
                          className={styles.fileInputOri}
                        />
                        <label
                          htmlFor="fileInputOri"
                          className={styles.fileLabel}
                        >
                          Choose Original File
                        </label>
                        <span className={styles.placeholder}>
                          {filenameOriginal}
                        </span>
                        {fileOriginalUploadError && (
                          <p className="text-red-500">
                            {fileOriginalUploadError}
                          </p>
                        )}
                      </div>
                    ) : loading ? (
                      <div className={styles.usermessage}>
                        <div className={styles.markdownanswer}>
                          File Original Uploading <LoadingDots color="#000" />
                        </div>
                      </div>
                    ) : (
                      <div className={styles.usermessage}>
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {`File Original Uploaded : ${filenameOriginal}`}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {!isFileCompareUploaded && !loading ? (
                      <div className="pt-5">
                        <input
                          type="file"
                          id="fileInputCom"
                          accept=".pdf"
                          onChange={handleFileCompareChange}
                          className={styles.fileInputCom}
                        />
                        <label
                          htmlFor="fileInputCom"
                          className={styles.fileLabel2nd}
                        >
                          Choose Compare File
                        </label>
                        <span className={styles.placeholder}>
                          {filenameCompare}
                        </span>
                        {fileCompareUploadError && (
                          <p className="text-red-500">
                            {fileCompareUploadError}
                          </p>
                        )}
                      </div>
                    ) : loading ? (
                      <div className={styles.usermessage}>
                        <div className={styles.markdownanswer}>
                          File Compare Uploading <LoadingDots color="#000" />
                        </div>
                      </div>
                    ) : (
                      <div className={styles.usermessage}>
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {`File Compare Uploaded : ${filenameCompare}`}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.usermessage}>
                  <div className={`${styles.markdownanswer} pl-12`}>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !(fileOriginal && fileCompare)}
                      className={`w-full ${
                        loading ? 'text-black' : 'bg-[#3444bd] hover:bg-[#685ef5] text-white'
                      } p-2 rounded`}
                    >
                      {loading ? (
                        <span>
                          Comparing <LoadingDots color="#000" />
                        </span>
                      ) : (
                        'Compare'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5" style={{ width: 700 }}>
              <p className="font-bold">Comparasion Result:</p>
              <p className="mt-5">
                {comparasionData.map((data, i) => (
                  <span key={i} className={`whitespace-pre-line ${data.added ? 'text-blue-700 bg-[#e1ebaa]' : data.removed ? 'text-red-600 bg-[#e1ebaa] line-through' : 'text-black'}`}>{data.value + ' '}</span>
                ))}
              </p>
            </div>

          </main>
          {error && (
            <div className="border border-red-400 rounded-md p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
