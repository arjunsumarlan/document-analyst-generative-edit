import { SetStateAction, useEffect, useRef, useState } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import LoadingDots from '@/components/ui/LoadingDots';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor, EditorSelection } from 'tinymce';
import PopUpGenerativeEdit from '../../components/ui/PopUpGenerativeEdit';

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditorReady, setEditorReady] = useState<boolean>(false);


  const [genEditPrompt, setGenEditPrompt] = useState<string>('');
  const [isGenEditOpen, setGenEditOpen] = useState<boolean>(false);
  const [selectedText, selectText] = useState<string>('');

  /** List of state for the form */
  const [isFormShow, setFormShow] = useState<boolean>(false);
  const [isPromptShow, setPromptShow] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [isFileNameFocused, setIsFileNameFocused] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  const [isPromptFocused, setIsPromptFocused] = useState<boolean>(false);
  const [contentEditor, setContentEditor] = useState<string>('');
  const [rawData, setRawData] = useState<string>('');

  const [date, setDate] = useState<string>('');
  const [giverName, setGiverName] = useState<string>('');
  const [giverAddress, setGiverAddress] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [receiverAddress, setReceiverAddress] = useState<string>('');
  const [additionalData, setAdditionalData] = useState<string>('');
  const [isGiverNameFocused, setIsGiverNameFocused] = useState<boolean>(false);
  const [isGiverAddressFocused, setIsGiverAddressFocused] = useState<boolean>(false);
  const [isReceiverNameFocused, setIsReceiverNameFocused] = useState<boolean>(false);
  const [isReceiverAddressFocused, setIsReceiverAddressFocused] = useState<boolean>(false);
  const [isAdditionalDataFocused, setIsAdditionalDataFocused] = useState<boolean>(false);

  const checkEmptyFields = () => {
    const emptyFields = [];

    if (!fileName) emptyFields.push('Nama Dokumen');
    if (!giverName) emptyFields.push('Nama Pihak Pengungkap');
    if (!giverAddress) emptyFields.push('Alamat Pihak Pengungkap');
    if (!receiverName) emptyFields.push('Nama Pihak Penerima');
    if (!receiverAddress) emptyFields.push('Alamat Pihak Penerima');
    if (!date) emptyFields.push('Tanggal');

    return emptyFields;
  };

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    const emptyFields = checkEmptyFields();
    if (emptyFields.length > 0) {
      setError('Data berikut belum lengkap: ' + emptyFields.join(', '));
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }

    setLoading(true);

    const originDate = new Date(date);

    const day = originDate.getDate().toString().padStart(2, '0');
    const month = (originDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed in JS
    const year = originDate.getFullYear();

    const finalDate = `${day} ${month} ${year}`;
    
    const query = `
      nama pihak pengungkap: ${giverName}
      alamat pihak pengungkap: ${giverAddress}
      nama pihak penerima: ${receiverName}
      alamat pihak penerima: ${receiverAddress}
      ${additionalData && `data tambahan atau pendukung: ${additionalData}`}
      tanggal: ${finalDate}
    `;

    try {
      const response = await fetch('/api/generateHtml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query
        }),
      });
      const data = await response.json();
      setContentEditor(data.html);
      setRawData(data.rawData);
      setPromptShow(true);

      setLoading(false);

    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && date && giverName && giverAddress && receiverName && receiverAddress) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  //handle form submission
  async function handleSubmitPrompt(e: any) {
    e.preventDefault();

    setError(null);

    const emptyFields = checkEmptyFields();
    if (emptyFields.length > 0) {
      setError('Data berikut belum lengkap: ' + emptyFields.join(', '));
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }

    if (!prompt) {
      setError('Prompt is empty');
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }

    setLoading(true);

    const originDate = new Date(date);

    const day = originDate.getDate().toString().padStart(2, '0');
    const month = (originDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed in JS
    const year = originDate.getFullYear();

    const finalDate = `${day} ${month} ${year}`;

    const query = `
      nama pihak pengungkap: ${giverName}
      alamat pihak pengungkap: ${giverAddress}
      nama pihak penerima: ${receiverName}
      alamat pihak penerima: ${receiverAddress}
      ${additionalData && `data tambahan atau pendukung: ${additionalData}`}
      tanggal: ${finalDate}

      instruksi: ${prompt}
    `;

    try {
      const response = await fetch('/api/generateHtml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query
        }),
      });
      const data = await response.json();
      setContentEditor(data.html);
      setRawData(data.rawData);

      setLoading(false);

    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnterPrompt = (e: any) => {
    if (e.key === 'Enter' && date && giverName && giverAddress && receiverName && receiverAddress && prompt) {
      handleSubmitPrompt(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  const handleEditorChange: (content: string, editor: TinyMCEEditor) => void = (content, editor) => {
    // Your code here...
    setContentEditor(content);
  };

  const handleDownloadDoc = async () => {
    setDownloading(true);

    if (!rawData) {
      setLoading(false);
      setError('No data found to download.');
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      console.log('error', error);
    }

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawData: contentEditor
        }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      setDownloading(false);

    } catch (error) {
      setDownloading(false);
      setError('An error occurred while fetching the data. Please try again.');
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      console.log('error', error);
    }
  }

  //handle gen edit prompt
  async function handleSubmitGenEditPrompt(e: any) {
    e.preventDefault();

    setError(null);

    const emptyFields = checkEmptyFields();
    if (emptyFields.length > 0) {
      setError('Data berikut belum lengkap: ' + emptyFields.join(', '));
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }

    if (!prompt) {
      setError('Prompt is empty');
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }

    setLoading(true);

    const originDate = new Date(date);

    const day = originDate.getDate().toString().padStart(2, '0');
    const month = (originDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed in JS
    const year = originDate.getFullYear();

    const finalDate = `${day} ${month} ${year}`;

    const query = `
      nama pihak pengungkap: ${giverName}
      alamat pihak pengungkap: ${giverAddress}
      nama pihak penerima: ${receiverName}
      alamat pihak penerima: ${receiverAddress}
      ${additionalData && `data tambahan atau pendukung: ${additionalData}`}
      tanggal: ${finalDate}

      instruksi: ${prompt}
    `;

    try {
      const response = await fetch('/api/generateHtml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query
        }),
      });
      const data = await response.json();
      setContentEditor(data.html);
      setRawData(data.rawData);

      setLoading(false);

    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      console.log('error', error);
    }
  }

  return (
    <>
      <Layout>
        <PopUpGenerativeEdit
          isOpen={isGenEditOpen}
          onClose={() => setGenEditOpen(false)}
          prompt={genEditPrompt}
          loading={loading}
          setPrompt={(e: SetStateAction<string>) => setGenEditPrompt(e)}
          handleSubmitPrompt={handleSubmitGenEditPrompt}
        />
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Legal Document Generator
          </h1>
          <main className={styles.main}>
            <div className={isFormShow ? styles.cloudgen : styles.cloud}>
              {
                isFormShow && !isPromptShow ?
                  <div className="flex flex-col w-1/3 justify-center items-center p-2">
                    <div className="mb-5 text-sm">Mohon lengkapi form berikut</div>
                    <form onSubmit={handleSubmit} className="space-y-4 w-9/12">
                      <div className="relative">
                        {isFileNameFocused && (
                          <label className="top-[-2rem] left-0 text-sm text-gray-400">
                            Nama Dokumen
                            <span className="text-red-600 ml-1">*</span>
                          </label>
                        )}
                        <input
                          type="text"
                          placeholder={isFileNameFocused ? '' : 'Nama Dokumen'}
                          value={fileName}
                          onKeyDown={handleEnter}
                          onChange={(e) => setFileName(e.target.value)}
                          onFocus={() => setIsFileNameFocused(true)}
                          onBlur={() => setIsFileNameFocused(fileName !== '')}
                          className="border p-2 w-full"
                        />
                      </div>
                      <div className="relative flex flex-row justify-between items-center">
                        <label className="mr-5 text-sm text-gray-400">
                          Tanggal
                          <span className="text-red-600 ml-1">*</span>
                        </label>
                        <input
                          type="date"
                          value={date}
                          onKeyDown={handleEnter}
                          onChange={(e) => setDate(e.target.value )}
                          className="border p-2 w-full"
                        />
                      </div>
                      <div className="relative">
                        {isGiverNameFocused && (
                          <label className="top-[-2rem] left-0 text-sm text-gray-400">
                            Nama Pihak Pengungkap
                            <span className="text-red-600 ml-1">*</span>
                          </label>
                        )}
                        <input
                          type="text"
                          placeholder={isGiverNameFocused ? '' : 'Nama Pihak Pengungkap'}
                          value={giverName}
                          onKeyDown={handleEnter}
                          onChange={(e) => setGiverName(e.target.value)}
                          onFocus={() => setIsGiverNameFocused(true)}
                          onBlur={() => setIsGiverNameFocused(giverName !== '')}
                          className="border p-2 w-full"
                        />
                      </div>
                      <div className="relative">
                        {isGiverAddressFocused && (
                          <label className="top-[-2rem] left-0 text-sm text-gray-400">
                            Alamat Pihak Pengungkap
                            <span className="text-red-600 ml-1">*</span>
                          </label>
                        )}
                        <textarea
                          placeholder={isGiverAddressFocused ? '' : 'Alamat Pihak Pengungkap'}
                          value={giverAddress}
                          onKeyDown={handleEnter}
                          onChange={(e) => setGiverAddress(e.target.value)}
                          onFocus={() => setIsGiverAddressFocused(true)}
                          onBlur={() => setIsGiverAddressFocused(giverAddress !== '')}
                          className="border p-2 w-full"
                        />
                      </div>
                      <div className="relative">
                        {isReceiverNameFocused && (
                          <label className="top-[-2rem] left-0 text-sm text-gray-400">
                            Nama Pihak Penerima
                            <span className="text-red-600 ml-1">*</span>
                          </label>
                        )}
                        <input
                          type="text"
                          placeholder={isReceiverNameFocused ? '' : 'Nama Pihak Penerima'}
                          value={receiverName}
                          onKeyDown={handleEnter}
                          onChange={(e) => setReceiverName(e.target.value)}
                          onFocus={() => setIsReceiverNameFocused(true)}
                          onBlur={() => setIsReceiverNameFocused(receiverName !== '')}
                          className="border p-2 w-full"
                        />
                      </div>
                      <div className="relative">
                        {isReceiverAddressFocused && (
                          <label className="top-[-2rem] left-0 text-sm text-gray-400">
                            Alamat Pihak Penerima
                            <span className="text-red-600 ml-1">*</span>
                          </label>
                        )}
                        <textarea
                          placeholder={isReceiverAddressFocused ? '' : 'Alamat Pihak Penerima'}
                          value={receiverAddress}
                          onKeyDown={handleEnter}
                          onChange={(e) => setReceiverAddress(e.target.value)}
                          onFocus={() => setIsReceiverAddressFocused(true)}
                          onBlur={() => setIsReceiverAddressFocused(receiverAddress !== '')}
                          className="border p-2 w-full"
                        />
                      </div>
                      <div className="relative">
                        {isAdditionalDataFocused && (
                          <label className="top-[-2rem] left-0 text-sm text-gray-400">
                            Data Tambahan?
                          </label>
                        )}
                        <textarea
                          placeholder={isAdditionalDataFocused ? '' : 'Data Tamabahan'}
                          value={additionalData}
                          onKeyDown={handleEnter}
                          onChange={(e) => setAdditionalData(e.target.value)}
                          onFocus={() => setIsAdditionalDataFocused(true)}
                          onBlur={() => setIsAdditionalDataFocused(additionalData !== '')}
                          className="border p-2 w-full"
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#bd3434] hover:bg-[#f55e5e] text-white p-2 rounded">
                        {
                          loading ? 
                            <span>
                              Generating{' '}
                              <LoadingDots color="#000" />
                            </span>
                            : 'Generate'
                        }
                      </button>
                    </form>
                  </div>
                  :
                  isPromptShow ?
                    <div className="flex flex-col w-1/3 justify-center items-center p-2">
                      <div className="mb-14 text-sm">Apa yang Anda ingin kami lakukan pada dokumen Anda?</div>
                      <form onSubmit={handleSubmitPrompt} className="space-y-4 w-9/12">
                        <div className="relative">
                          {isPromptFocused && (
                            <label className="top-[-2rem] left-0 text-sm text-gray-400">
                              Perintah Anda
                              <span className="text-red-600 ml-1">*</span>
                            </label>
                          )}
                          <textarea
                            placeholder={isPromptFocused ? '' : 'Masukkan Perintah Anda disini'}
                            value={prompt}
                            onKeyDown={handleEnterPrompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onFocus={() => setIsPromptFocused(true)}
                            onBlur={() => setIsPromptFocused(prompt !== '')}
                            className="border p-2 w-full"
                          />
                        </div>
                        <button type="submit" className="w-full bg-[#bd3434] hover:bg-[#f55e5e] text-white p-2 rounded">
                          {
                            loading ? 
                              <span>
                                Processing{' '}
                                <LoadingDots color="#000" />
                              </span>
                              : 'Generative Edit'
                          }
                        </button>
                        <button
                          onClick={handleDownloadDoc}
                          disabled={loading || downloading}
                          className={`w-full ${loading || downloading ? '' : 'bg-[#3444bd] hover:bg-[#685ef5]'} text-white p-2 rounded`}
                        >
                          {
                            downloading ? 
                              <span>
                                Downloading{' '}
                                <LoadingDots color="#000" />
                              </span>
                              : 'Download'
                          }
                        </button>
                      </form>
                    </div>
                    :
                    <div className="flex flex-col justify-center items-center py-4">
                      <button onClick={() => setFormShow(true)} className="text-white cursor-pointer flex flex-col m-1 justify-center items-center text-center rounded-lg text-lg px-3 h-10 bg-opacity-80 bg-[#c66b6b] hover:bg-[#B61516] no-underline">
                        Non-Disclosure Agreement (NDA)
                      </button>
                      <button className="text-white cursor-pointer flex flex-col m-1 justify-center items-center text-center rounded-lg text-lg px-3 h-10 bg-opacity-80 bg-[#c66b6b] no-underline">
                        Offering Letter (soon)
                      </button>
                      <button className="text-white cursor-pointer flex flex-col m-1 justify-center items-center text-center rounded-lg text-lg px-3 h-10 bg-opacity-80 bg-[#c66b6b] no-underline">
                        More soon ...
                      </button>
                    </div>
              }
              {
                isFormShow && 
                <div className="flex flex-col w-2/3 justify-center items-center">
                  <div className="mb-1 font-bold text-base">NON-DISCLOSURE AGREEMENT (NDA)</div>
                  <div className={`mb-5 font-bold text-base ${fileName ? 'text-black' : 'text-gray-400'}`}>{fileName || 'Nama Dokumen Anda'}</div>
                  {
                    !isEditorReady &&
                    <div className="flex justify-center items-center h-full">
                        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                    </div>
                  }
                  <Editor
                    id='editor-tinymce'
                    apiKey='wbhbur6u710wdtee4xlaia68bbvlgnv864lncj2vaumi37zz'
                    value={contentEditor}
                    onInit={() => setEditorReady(true)}
                    init={{
                      height: 500,
                      menubar: false,
                      plugins: ['link', 'paste', 'table'],
                      toolbar:
                        'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | GenerativeEdit',
                        // 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
                      setup: (editor) => {
                        editor.ui.registry.addButton("GenerativeEdit", {
                          text: "Generative Edit",
                          icon: "line",
                          tooltip:
                            "Highlight the text and click this button to generate text by your prompt",
                          enabled: true,
                          onAction: async () => {
                            const selection = editor.selection.getContent();
            
                            if (selection !== "") {
                              setGenEditOpen(true);
                              selectText(selection);
                            } else {
                              alert("Please select the text in your doc");
                            }
                          },
                        });
                      },
                    }}
                    onEditorChange={handleEditorChange}
                  />
                </div>
              }
            </div>
            {error && (
              <div className="border border-red-400 rounded-md m-3 p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </main>
        </div>
      </Layout>
    </>
  );
}
