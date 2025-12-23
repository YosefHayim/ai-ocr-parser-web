import { Button } from "@/Components/ui/button";
import { FaFileUpload } from "react-icons/fa";
import { GlobalStateProps } from "../Homepage";
import LoadingEffect from "../LoadingEffect/LoadingEffect";
import { Toaster } from "sonner";

interface FormContainerProps {
  fileName: string | null;
  data?: null;
  selectedFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  globalState: GlobalStateProps;
}

const FormContainer: React.FC<FormContainerProps> = ({ fileName, data, selectedFile, fileInputRef, handleFileChange, globalState }) => {
  const handleFormClick = (e: React.MouseEvent<HTMLFormElement>) => {
    // Prevent triggering file input if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("[data-action]")) {
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div>
      <Toaster position="top-center" dir="rtl" />
      {globalState.isLoading ? (
        <LoadingEffect fileName={fileName} />
      ) : (
        <div>
          <div className="w-full text-right">
            <label htmlFor="file" className="font-bold">
              העלאה קובץ
            </label>
          </div>
          <form className="cursor-pointer rounded-lg border border-dotted bg-gray-200 p-4" onClick={handleFormClick}>
            <div className="flex w-full flex-col items-center justify-center gap-2">
              <FaFileUpload size={40} className="rounded-sm p-1" />
              <div className="relative w-full text-center">
                {fileName}
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".pdf"
                  required={true}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="flex items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
                {data && <Button data-action="reset">אפס תוצאות</Button>}
                {data && <Button data-action="upload-again">חשב שוב</Button>}
                {!selectedFile && (
                  <Button
                    data-action="pick-file"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary text-primary-foreground shadow-xs cursor-pointer rounded-full p-2 px-4 font-bold hover:bg-white hover:text-black"
                  >
                    בחר קובץ
                  </Button>
                )}
                {selectedFile && !data && <Button data-action="upload">העלאה קובץ</Button>}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FormContainer;
