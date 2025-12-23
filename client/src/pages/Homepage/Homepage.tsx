import { useEffect, useRef, useState } from "react";

import CopyResults from "./CopyResultsTooltip/CopyResults";
import CreateTooltipTriggerTemplate from "./CopyResultsTooltip/CreateTooltipTriggerTemplate/CreateTooltipTriggerTemplate";
import Footer from "@/Components/Footer/Footer";
import FormContainer from "./FormContainer/FormContainer";
import Navbar from "@/Components/Navbar/Navbar";
import OcrScannedCard from "./OcrScannedCard/OcrScannedCard";
import { useHandleFileChange } from "@/CustomHooks/useHandleFileChange";
import { useHandleGlobalHandler } from "@/CustomHooks/useHandleGlobalHomepage";
import { useMutatePdfFile } from "@/CustomHooks/useMutatePdfFile";
import { useSockets } from "@/CustomHooks/useSockets";

export interface GlobalStateProps {
  isLoading: boolean | null;
  pageNumberToRecalculateDataAgain: boolean | null;
  fileName: string | null;
  selectedFile: File | null;
  replacedPageInfo: string | null;
  data?: null;
}

export interface OCRScannedProps {
  page?: string | null;
  supplierName?: string | null;
  totalQuantity?: number | null;
  totalPayment?: number | null;
}

export interface ProgressBarDataProps {
  currentPage: number | null;
  totalPages: number | null;
  percent: number | null;
}

const Homepage = () => {
  useSockets();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [globalState, setGlobalState] = useState<GlobalStateProps>({
    isLoading: false,
    pageNumberToRecalculateDataAgain: null,
    replacedPageInfo: null,
    fileName: null,
    data: null,
    selectedFile: null,
  });
  const mutatePdfFile = useMutatePdfFile(setGlobalState, globalState);
  const handleFileChange = useHandleFileChange(setGlobalState, globalState);
  // const mutateRecalculatePageInfo = useRecalculatePageInfo(
  //   setGlobalState,
  //   globalState,
  // );
  const handleGlobalClick = useHandleGlobalHandler(setGlobalState, globalState, fileInputRef, mutatePdfFile);

  useEffect(() => {}, [globalState]);

  return (
    <div>
      <div>
        <Navbar />
        <div onClick={handleGlobalClick} className="flex min-h-screen w-full flex-col items-center justify-start gap-4 p-4" dir="rtl">
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col gap-2 bg-white p-4">
              <FormContainer
                globalState={globalState}
                handleFileChange={handleFileChange}
                data={globalState.data}
                fileName={globalState.fileName}
                fileInputRef={fileInputRef}
                selectedFile={globalState.selectedFile}
              />
              <div className="flex w-full flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex w-full items-start justify-start gap-1">
                    {globalState.data && <h1 className="text-right font-bold">תוצאות של הקובץ</h1>}{" "}
                    <p className="font-bold underline">{globalState.fileName}</p>
                    <CopyResults data={globalState.data} />
                  </div>
                </div>
                <div className={`all-data ${globalState.data ? "bg-gray-200" : ""} flex flex-col gap-4 rounded-lg p-4`}>
                  {!globalState.data ||
                    globalState.data === null ||
                    (globalState.data === undefined && <p> {globalState.fileName} לא נמצאו תוצאות בקובץ.</p>)}
                  {globalState.data &&
                    globalState.data.length >= 1 &&
                    globalState.data.map((ocrScanned: OCRScannedProps, index: number) => <OcrScannedCard ocrScanned={ocrScanned} key={index} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Homepage;
