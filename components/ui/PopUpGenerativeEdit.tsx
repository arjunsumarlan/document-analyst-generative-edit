import { FormEventHandler, KeyboardEventHandler, MouseEventHandler } from "react";
import LoadingDots from "./LoadingDots";

const PopUpGenerativeEdit = ({
  handleSubmitPrompt = () => {},
  setPrompt = () => {},
  isOpen = false,
  onClose = () => {},
  prompt = '',
  loading = false,
}: {
  handleSubmitPrompt: FormEventHandler<HTMLFormElement>;
  setPrompt: Function;
  isOpen: boolean;
  onClose: MouseEventHandler<HTMLButtonElement>;
  prompt: string;
  loading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
      <div className="flex flex-col items-center justify-center w-1/2 h-1/2 p-2 bg-white shadow-lg">
        <div className="mb-5 text-sm">
          Apa yang Anda ingin kami lakukan pada text yang Anda highlight?
        </div>
        <form onSubmit={handleSubmitPrompt} className="space-y-4 w-9/12">
          <div className="relative">
            <label className="top-[-2rem] left-0 text-sm text-gray-400">
                Perintah Anda
                <span className="text-red-600 ml-1">*</span>
              </label>
            <textarea
              placeholder=''
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="border p-2 w-full"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#bd3434] hover:bg-[#f55e5e] text-white p-2 rounded"
          >
            {loading ? (
              <span>
                Processing <LoadingDots color="#000" />
              </span>
            ) : (
              'Generative Edit'
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className={`w-full ${loading ? '' : 'bg-[#3444bd] hover:bg-[#685ef5]'} text-white p-2 rounded`}
          >
            Close
          </button>
        </form>
      </div>
    </div>
  );
};

export default PopUpGenerativeEdit;

PopUpGenerativeEdit.defaultProps = {
  loading: false,
  isOpen: false,
  prompt: '',
};
