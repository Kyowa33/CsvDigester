import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primeicons/primeicons.css';
import { useState, useEffect } from 'react'
//import Switcher from './component/Switcher.js';
import './App.css'
import { ProgressBar } from 'primereact/progressbar';
import { CsvException } from './component/CsvException';
import { CsvParser } from './component/CsvParser';
import { CsvProcessor } from './component/CsvProcessor';
import { CsvConfig } from './component/CsvConfig';

function App() {

  const SENS_ENCRYPT = "0";
  const SENS_DECRYPT = "1";

  const STATUS_INIT = 0;
  const STATUS_LOADING = 1;
  const STATUS_READY = 2;
  const STATUS_WORKING = 3;

  const [pass, setPass] = useState("");
  const [sens, setSens] = useState(SENS_ENCRYPT);
  const [status, setStatus] = useState(STATUS_INIT);
  const [statusTxt, setStatusTxt] = useState("Veuillez sélectionner un fichier au format TXT ou CSV.");
  const [statusLvl, setStatusLvl] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [fileData, setFileData] = useState(new ArrayBuffer(0));
  const [preview, setPreview] = useState([] as string[][]);
  const [fileResult, setFileResult] = useState(null as Uint8Array[] | null);
  const [fileName, setFileName] = useState("");
  const [fileNameResult, setFileNameResult] = useState("");
  const [csvParser] = useState(new CsvParser());
  const [csvColBundle, setCsvColBundle] = useState(-1);
  const [csvConfig, setCsvConfig] = useState(new CsvConfig(undefined));

  useEffect(() => {
    // Cette fonction s'exécute uniquement au chargement de l'app
    try {
      CsvProcessor.staticInit();
      doSelectColBundle('0');
    }
    catch (e) {
      if (e instanceof CsvException) {
        csvParser.getReturnInfo().info = e;
        handleFecParserReturnInfo();
      } else {
        setStatusLvl(3);
        setStatusTxt("Erreur : " + e);
      }
    }

    // Optionnel : retourne une fonction de nettoyage si besoin
    return () => {

    };
  }, []); // 📌 Tableau vide = exécuté une seule fois après le premier rendu




  const getMessage = (fecEx: CsvException) => {
    if (!fecEx) {
      return "";
    }
    switch (fecEx.getCode()) {
      case CsvException.CODE_RET_TERMINATED:
        return "Terminé";

      case CsvException.CODE_RET_EXCEPTION:
        return "Erreur"

      case CsvException.CODE_RET_NO_DATA:
        return "Aucune donnée trouvée";

      case CsvException.CODE_RET_NO_ROWS:
        return "Aucune ligne trouvée";

      case CsvException.CODE_RET_HEADER_MALFORMED:
        return "La ligne d'entête est malformée";

      case CsvException.CODE_RET_HEADER_MISMATCH:
        return "La ligne d'entête ne respecte pas le format officiel";

      case CsvException.CODE_RET_INTERRUPTED:
        return "Le traitement a été interrompu";

      case CsvException.CODE_RET_ROW_CELL_COUNT_MISMATCH:
        return "Ligne ignorée : Le nombre de champs ne correspond pas à l'entête";

      case CsvException.CODE_RET_COLUMNS_SPEC:
        return "La colonne " + fecEx.getParams()[0] + " ne respecte pas les possibilités valides";

      case CsvException.CODE_RET_CELL_FORMAT_MISMATCH:
        return "La valeur de la colonne " + fecEx.getParams()[0] + " ne respecte pas le format spécifié";

      case CsvException.CODE_RET_ERR_ENCRYPT:
        return "Le cryptage a échoué";

      case CsvException.CODE_RET_ERR_DECRYPT:
        return "Le mot de passe spécifié ne permet pas de décrypter les données";

      case CsvException.CODE_RET_ERR_CIPHER_9:
      case CsvException.CODE_RET_ERR_CIPHER_16:
      case CsvException.CODE_RET_ERR_CIPHER_64:
        return "L'encodage a échoué à la colonne " + fecEx.getParams()[0];

      case CsvException.CODE_RET_ERR_UNCIPHER_9:
      case CsvException.CODE_RET_ERR_UNCIPHER_16:
      case CsvException.CODE_RET_ERR_UNCIPHER_64:
        return "Le champ encodé est erronné à la colonne " + fecEx.getParams()[0];

      case CsvException.CODE_RET_ERR_HASH:
        return "Le hashage du mot de passe a échoué (" + fecEx.getParams()[0] + ")";

      case CsvException.CODE_RET_ERR_BUNDLE_CELL_NONE:
        return "Aucune définition de format de cellule";

      case CsvException.CODE_RET_ERR_BUNDLE_COL_NONE:
        return "Aucune définition de format de fichier";

      case CsvException.CODE_RET_ERR_BUNDLE_COL_NOT_FOUND:
        return "Définition de format de fichier introuvable : " + fecEx.getParams()[0];

      case CsvException.CODE_RET_ERR_BUNDLE_COL_CELLSPECID_UNDEFINED:
        return "Erreur de définition pour la colonne " + fecEx.getParams()[0] + " : Le type de donnée " + fecEx.getParams()[1] + " n'est pas défini";

      case CsvException.CODE_RET_ERR_BUNDLE_COL_NO_RADIX:
        return "Erreur de définition pour la colonne " + fecEx.getParams()[0] + " : Le type de donnée " + fecEx.getParams()[1] + " n'est pas encodable en respectant le format";

      case CsvException.CODE_RET_ERR_BUNDLE_COL_NEXT_UNDEFINED:
        return "Erreur de définition pour la colonne " + fecEx.getParams()[0] + " : La prochaine colonne " + fecEx.getParams()[1] + " n'est pas définie";

      case CsvException.CODE_RET_ERR_BUNDLE_COL_NO_BEGINNING:
        return "Aucune colonne de départ";

      case CsvException.CODE_RET_ERR_BUNDLE_COL_CORRUPTED:
        return "Fichier de spécification de format importé corrompu";

      case CsvException.CODE_RET_ERR_BUNDLE_CELL_CORRUPTED:
        return "Fichier de spécification de cellules importé corrompu";

      default: return "";
    }
  }

  const handleFecParserReturnInfo = () => {

    if ((!csvParser)
      || (!csvParser.getReturnInfo())
      || (!csvParser.getReturnInfo().info)
      || (csvParser.getReturnInfo().info.getCode() === CsvException.CODE_RET_UNKNOWN)) {
      return;
    }

    setStatusLvl(2);

    let returnInfo = csvParser.getReturnInfo();
    let info = returnInfo.info;
    let warn = returnInfo.warn;

    let msg = getMessage(info);

    switch (info.getCode()) {

      case CsvException.CODE_RET_TERMINATED:

        if (warn.length > 0) {
          setStatusLvl(1);
          setStatusTxt(msg + " (" + info.getRow() + " lignes traitées) avec " + warn.length + " remarque(s).");
        } else {
          setStatusLvl(0);
          setStatusTxt(msg + " (" + info.getRow() + " lignes traitées)");
        }
        setProgress(100);
        let result = csvParser.getGridDataCellSample();
        setPreview(result);
        let resultDat = csvParser.getGridData();
        setFileResult(resultDat);
        break;

      case CsvException.CODE_RET_EXCEPTION:
        setStatusTxt("Erreur ligne " + info.getRow() + " : " + info.getParams()[0]);
        setProgress(0);
        break;

      case CsvException.CODE_RET_ERR_CIPHER_9:
      case CsvException.CODE_RET_ERR_CIPHER_16:
      case CsvException.CODE_RET_ERR_CIPHER_64:
      case CsvException.CODE_RET_ERR_UNCIPHER_9:
      case CsvException.CODE_RET_ERR_UNCIPHER_16:
      case CsvException.CODE_RET_ERR_UNCIPHER_64:
      case CsvException.CODE_RET_CELL_FORMAT_MISMATCH:
        setStatusTxt("Erreur ligne " + info.getRow() + " : " + msg);
        setProgress(0);
        break;

      case CsvException.CODE_RET_INTERRUPTED:
        setStatusLvl(1);
      default:
        setStatusTxt(msg + ".");
        setProgress(0);
        break;

    }
    setStatus(STATUS_READY);
  }

  const resetResultInfos = () => {
    setPreview([] as string[][]);
    setFileResult(null);
    setFileNameResult("");
    setProgress(0);
    csvParser.reset();
    setStatus(STATUS_INIT);
  }

  // const resetInputInfos = () => {
  //   setFileName("");
  //   setFileData(new ArrayBuffer(0));
  // }

  const startTreatment = async () => {

    if (fileData.byteLength > 0) {
      try {
        resetResultInfos();
        setFileNameResult(csvConfig.getOutputFileName(fileName, Number.parseInt(sens)))
        let proc = new CsvProcessor();
        setStatus(STATUS_WORKING);
        setStatusLvl(-1);
        setStatusTxt("Traitement en cours...");
        CsvProcessor.setConfig(csvConfig); // config can have been changed by user
        CsvProcessor.applyColBundle(csvColBundle); // must reapply bundle according to new config
        await proc.init(pass);
        let inputData = new Uint8Array(fileData);
        csvParser.init((sens === SENS_ENCRYPT), proc, inputData, (progressRate) => {
          if (progressRate) {
            setProgress(progressRate);
          } else {
            handleFecParserReturnInfo();
          }
        });

        await csvParser.startParse();
        handleFecParserReturnInfo();
      }
      catch (e) {
        if (e instanceof CsvException) {
          csvParser.getReturnInfo().info = e;
          handleFecParserReturnInfo();
        } else {
          setStatusLvl(3);
          setStatusTxt("Erreur : " + e);
        }
        setStatus(STATUS_READY);
      }
    }
  }

  const handleStartCancel = async () => {
    if (csvParser) {
      if (status === STATUS_WORKING) {
        csvParser.stop();
        resetResultInfos();
      }
      else
        if (status === STATUS_READY) {
          await startTreatment();
        }
    }
  }

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];

    resetResultInfos();

    setStatusLvl(-1);
    setStatusTxt("Chargement en cours...");
    setStatus(STATUS_LOADING);

    const reader = new FileReader();

    reader.onload = async (e) => {
      if (!e.target?.result) {
        console.error("No buffer in reader.");
        setStatus(STATUS_INIT);
        return;
      }

      setFileData(e.target.result as ArrayBuffer);
      setStatusTxt("Prêt à démarrer");
      setStatus(STATUS_READY);
    };

    reader.readAsArrayBuffer(file);
    setFileName(file.name);
  };


  const downloadCSV = (byteData: Uint8Array[], filename: string) => {
    const blob = new Blob(byteData, { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handlePassChange = (event: any) => {
    setPass(event.target.value);
  }

  const selectSens = (event: any) => {
    setSens(event.target.value);
  };

  const doSelectColBundle = (bundleIndex: string) => {
    const idx = Number.parseInt(bundleIndex)
    setCsvColBundle(idx);
    CsvProcessor.setConfig(csvConfig);
    CsvProcessor.applyColBundle(idx);
    const curBundle = CsvProcessor.getActiveColBundle();
    if (curBundle !== undefined) {
      csvConfig.mustFollowColOrder = (curBundle.orderStrict === "1");
      csvConfig.mustTestColRegExp = (curBundle.valueStrict === "1");
      setCsvConfig(new CsvConfig(csvConfig));
    }
  }

  const selectColBundle = (event: any) => {
    doSelectColBundle(event.target.value);
  }

  const handleDownload = () => {
    if (status !== STATUS_READY) {
      return;
    }

    if (fileResult)
      downloadCSV(fileResult, fileNameResult);
  }



  const getAlertStyle = (severity: number) => {
    switch (severity) {
      case 0:
        return 'bg-green-50 text-green-700 border-green-200';
      case 1:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 2:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'; // par défaut
    }
  };


  const handleChangeFollowColOrder = (event: any) => {
    csvConfig.mustFollowColOrder = event.target.checked;
    setCsvConfig(new CsvConfig(csvConfig));
  }

  const handleChangeTestColRegExp = (event: any) => {
    csvConfig.mustTestColRegExp = event.target.checked;
    setCsvConfig(new CsvConfig(csvConfig));
  }

  const isBusy = () => {
    return (status !== STATUS_READY) && (status !== STATUS_INIT);
  }

  return (
    <div className="App bg-white text-gray-800 min-h-screen p-6 font-sans">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Encodage / Décodage de fichier CSV</h1>

        <div className="header-container mb-6">
          <input
            type="password"
            id="pwd"
            value={pass}
            onChange={handlePassChange}
            disabled={isBusy()}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-1"
          />
          <label htmlFor="pwd" className="block text-sm text-gray-600">
            Clé de chiffrement (mot de passe)
          </label>
        </div>

        <div className="header-container mb-6">
          <select
            id="sens"
            value={sens}
            onChange={selectSens}
            disabled={isBusy()}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={SENS_ENCRYPT}>Crypter</option>
            <option value={SENS_DECRYPT}>Décrypter</option>
          </select>
        </div>

        <div className="header-container mb-6">
          <select
            id="colBundle"
            value={csvColBundle}
            onChange={selectColBundle}
            disabled={isBusy()}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {
              CsvProcessor.colBundles.map((bundle, index) => {
                return (
                  <option key={index} value={"" + index}>{bundle.name} {bundle.version} {bundle.date}</option>
                );
              })
            }
          </select>
        </div>

        <div className="header-container mb-6">
          <label>
            <input
              type="checkbox"
              checked={csvConfig.mustFollowColOrder}
              onChange={handleChangeFollowColOrder}
            />
            &nbsp;Respecter l'ordre des colonnes
          </label>
        </div>

        <div className="header-container mb-6">
          <label>
            <input
              type="checkbox"
              checked={csvConfig.mustTestColRegExp}
              onChange={handleChangeTestColRegExp}
            />
            &nbsp;Respecter le format des colonnes
          </label>
        </div>

        <div id="fileSection" className="file-section space-y-4">
          <div className="mb-3">
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              accept=".csv, .txt"
              disabled={isBusy()}
              className="hidden"
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer block w-full text-center px-4 py-3 bg-blue-50 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100 transition-all"
            >
              Cliquez ici pour sélectionner un fichier
            </label>
          </div>

          <div>
            <button
              onClick={handleStartCancel}
              style={{ "display": (fileData.byteLength > 0) ? "block" : "none" }}
              className={isBusy() ? "w-full px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-all"
                : "w-full px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-200 transition-all"}
            >
              {isBusy() ? "Annuler le traitement" : "Démarrer le traitement"}<br/>{fileName}
            </button>
          </div>

          <div className={`alert p-3 rounded-md ${!statusTxt ? 'hidden' : ''} ${getAlertStyle(statusLvl)}`}>
            {statusTxt}
          </div>

          <div className="progress mt-2">
            <ProgressBar value={progress} showValue
              className="h-8 flex items-center" style={{ transition: 'none', animation: 'none' }} />
          </div>

          <div style={{ display: preview.length > 0 ? "block" : "none" }}>
            <label className="block mb-2 font-medium">Prévisualisation du résultat après traitement</label>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <tbody>
                  {preview.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {item.map((cell, idx) => (
                        <td
                          key={idx}
                          title={cell.length > 10 ? cell : ""}
                          className="border border-gray-300 px-3 py-2 text-sm"
                        >
                          {cell.length > 10 ? cell.substring(0, 10) + "..." : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            style={{
              display:
                csvParser.getReturnInfo().warn.length > 0 ? "block" : "none",
            }}
          >
            <label className="block mb-2 font-medium">Remarques</label>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-yellow-300">
                <tbody>
                  {csvParser
                    .getReturnInfo()
                    .warn.slice(0, CsvParser.MAX_SAMPLE_ROWS)
                    .map((item, index) => (
                      <tr key={index} className="hover:bg-yellow-50">
                        <td className="border border-yellow-300 px-3 py-2 text-sm">
                          Ligne {item.getRow()} : {getMessage(item)}
                        </td>
                      </tr>
                    ))}
                  {csvParser.getReturnInfo().warn.length >
                    CsvParser.MAX_SAMPLE_ROWS && (
                      <tr>
                        <td className="border border-yellow-300 px-3 py-2 text-sm text-yellow-700">
                          ...{csvParser.getReturnInfo().warn.length - CsvParser.MAX_SAMPLE_ROWS} autres remarques.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <button
              onClick={handleDownload}
              disabled={isBusy() || !fileResult}
              className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${isBusy() || !fileResult
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
                }`}
            >
              Télécharger le résultat<br />{(fileResult) ? fileNameResult : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


