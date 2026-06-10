"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { 
  ArrowLeft, Search, CheckSquare, Square, FileText, Globe, Terminal, Play, 
  Loader2, Download, ExternalLink, ShieldCheck, Plus, Trash2, CheckCircle2, 
  HelpCircle, ChevronRight, AlertTriangle, Maximize2, Minimize2
} from "lucide-react";

interface CrawlerSource {
  title: string;
  status: "queued" | "scanned" | "downloaded" | "indexed";
  parentUrl: string | null;
  hasErrors?: boolean;
}

interface DiscoveredLink {
  title: string;
  url: string;
  type: "document" | "html_page" | "other";
  contentType: string;
  status?: "downloaded" | "indexed" | "failed" | null;
  checked?: boolean;
  originalIndex?: number;
}

export default function ParserAdminPage() {
  const [sources, setSources] = useState<Record<string, CrawlerSource>>({});
  const [newUrl, setNewUrl] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [vectorizeController, setVectorizeController] = useState<AbortController | null>(null);
  
  const [scanResult, setScanResult] = useState<{
    title: string;
    extractedText: string;
    links: DiscoveredLink[];
  } | null>(null);

  const [shouldIndexParent, setShouldIndexParent] = useState(true);
  const [parentStatus, setParentStatus] = useState<"downloaded" | "indexed" | null>(null);
  const [parentText, setParentText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLogsExpanded, setIsLogsExpanded] = useState(false);
  
  const logContainerRef = React.useRef<HTMLDivElement>(null);
  const topContainerRef = React.useRef<HTMLDivElement>(null);
  const logsOuterRef = React.useRef<HTMLDivElement>(null);

  // GSAP animation for expanding/collapsing logs panel
  useEffect(() => {
    const topEl = topContainerRef.current;
    const logsEl = logsOuterRef.current;
    const innerLogEl = logContainerRef.current;
    if (!topEl || !logsEl || !innerLogEl) return;

    // Kill any active tweens to prevent conflicts
    gsap.killTweensOf([topEl, logsEl, innerLogEl]);

    if (isLogsExpanded) {
      // 1. Collapse Top Container
      gsap.to(topEl, {
        height: 0,
        flexGrow: 0,
        opacity: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        pointerEvents: "none",
        duration: 0.5,
        ease: "power3.inOut",
        onComplete: () => {
          topEl.style.display = "none";
        }
      });
      // 2. Expand Logs Container to fill remaining space
      gsap.to(logsEl, {
        height: "100%",
        flexGrow: 1,
        duration: 0.5,
        ease: "power3.inOut",
      });
      // 3. Expand Inner Log Scrollable container
      gsap.to(innerLogEl, {
        height: "100%",
        flexGrow: 1,
        duration: 0.5,
        ease: "power3.inOut",
      });
    } else {
      // Restore Top Container to display flex before animating height back
      topEl.style.display = "flex";
      topEl.style.pointerEvents = "auto";

      // 1. Expand Top Container
      gsap.to(topEl, {
        height: "auto",
        flexGrow: 1,
        opacity: 1,
        marginBottom: "",
        paddingTop: "",
        paddingBottom: "",
        marginTop: "",
        duration: 0.5,
        ease: "power3.inOut",
        clearProps: "all"
      });
      // 2. Shrink Logs Container
      gsap.to(logsEl, {
        height: "9rem", // h-36 is 144px / 9rem
        flexGrow: 0,
        duration: 0.5,
        ease: "power3.inOut",
        clearProps: "all"
      });
      // 3. Shrink Inner Log Scrollable container
      gsap.to(innerLogEl, {
        height: "6rem", // h-24 is 96px / 6rem
        flexGrow: 0,
        duration: 0.5,
        ease: "power3.inOut",
        clearProps: "all"
      });
    }
  }, [isLogsExpanded]);

  const [progressTotal, setProgressTotal] = useState(0);
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const vectorizeStartTimestampRef = React.useRef<number | null>(null);
  const lastChunkKeyRef = React.useRef<string | null>(null);
  const lastChunkTimestampRef = React.useRef<number | null>(null);
  const chunkDurationsRef = React.useRef<number[]>([]);
  const [stats, setStats] = useState({
    sourcesCount: 0,
    errorsCount: 0,
    downloadedCount: 0,
    indexedCount: 0
  });
  const statsBaselineRef = React.useRef<typeof stats | null>(null);
  const [scannedCache, setScannedCache] = useState<Record<string, { title: string; extractedText: string; links: DiscoveredLink[] }>>({});

  // Dynamic chunk velocity tracker
  useEffect(() => {
    if (!isVectorizing || logs.length === 0) return;

    let lastChunkLine = "";
    let lastChunkFile = "";
    
    // Scan backwards to find the active file and last chunk log
    for (let i = logs.length - 1; i >= 0; i--) {
      const line = logs[i];
      if (!lastChunkLine && line.includes("Индексация чанка")) {
        lastChunkLine = line;
      }
      if (!lastChunkFile && line.includes("Векторизация:")) {
        const match = line.match(/Векторизация:\s+["'](.*?)["']\s+\((.*?)\)/);
        if (match) {
          lastChunkFile = match[2]; // filename
        }
      }
    }

    if (lastChunkLine && lastChunkFile) {
      const match = lastChunkLine.match(/Индексация чанка\s+(\d+)\/(\d+)/);
      if (match) {
        const chunkIndex = parseInt(match[1]);
        const chunkKey = `${lastChunkFile}-chunk-${chunkIndex}`;

        if (lastChunkKeyRef.current !== chunkKey) {
          const now = Date.now();
          if (lastChunkTimestampRef.current !== null) {
            const duration = (now - lastChunkTimestampRef.current) / 1000; // in seconds
            // Ignore outliers
            if (duration > 0.05 && duration < 20) {
              chunkDurationsRef.current.push(duration);
              if (chunkDurationsRef.current.length > 25) {
                chunkDurationsRef.current.shift();
              }
            }
          }
          lastChunkKeyRef.current = chunkKey;
          lastChunkTimestampRef.current = now;
        }
      }
    }
  }, [logs, isVectorizing]);

  // Real-time stats calculation during vectorization run
  useEffect(() => {
    if (isVectorizing) {
      if (!statsBaselineRef.current) {
        statsBaselineRef.current = { ...stats };
      }
      
      let localIndexed = 0;
      let localFailed = 0;
      const processedFiles = new Set<string>();

      for (const log of logs) {
        const successMatch = log.match(/Файл\s+["'](.*?)["']\s+успешно проиндексирован/i) || log.match(/Файл\s+(.*?)\s+успешно проиндексирован/i);
        if (successMatch) {
          const filename = successMatch[1];
          if (!processedFiles.has(filename)) {
            processedFiles.add(filename);
            localIndexed++;
          }
        }

        const failMatch = log.match(/Ошибка векторизации\s+(.*?):/i);
        if (failMatch) {
          const filename = failMatch[1].trim();
          if (!processedFiles.has(filename)) {
            processedFiles.add(filename);
            localFailed++;
          }
        }
      }

      setStats({
        sourcesCount: statsBaselineRef.current.sourcesCount,
        errorsCount: statsBaselineRef.current.errorsCount + localFailed,
        downloadedCount: Math.max(0, statsBaselineRef.current.downloadedCount - localIndexed - localFailed),
        indexedCount: statsBaselineRef.current.indexedCount + localIndexed
      });
    } else {
      statsBaselineRef.current = null;
    }
  }, [logs, isVectorizing]);

  // Timer loop for estimated remaining time (chunk-based + dynamic speed calculation)
  useEffect(() => {
    if (!isVectorizing) {
      setEstimatedTimeRemaining(null);
      // Clean up chunk timing references
      lastChunkKeyRef.current = null;
      lastChunkTimestampRef.current = null;
      chunkDurationsRef.current = [];
      return;
    }

    const interval = setInterval(() => {
      // 1. Calculate average chunk duration
      const durations = chunkDurationsRef.current;
      const avgChunkDuration = durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 1.0; // default baseline: 1.0s per chunk

      // 2. Scan logs to find completed/total chunks of files
      let currentFileTotal = 0;
      let currentFileCompleted = 0;
      const processedFilesChunks: number[] = [];

      let currentFile = "";
      for (const log of logs) {
        const fileMatch = log.match(/Векторизация:\s+["'](.*?)["']\s+\((.*?)\)/);
        if (fileMatch) {
          currentFile = fileMatch[2]; // filename
        }

        const splitMatch = log.match(/Разбито на\s+(\d+)\s+фрагментов/);
        if (splitMatch && currentFile) {
          // If this is the active file
          if (lastChunkKeyRef.current?.startsWith(currentFile)) {
            currentFileTotal = parseInt(splitMatch[1]);
          }
        }

        if (log.includes("успешно проиндексирован")) {
          const match = log.match(/\((\d+)\s+чанков\)/) || log.match(/\((\d+)\s+фрагментов\)/);
          if (match) {
            processedFilesChunks.push(parseInt(match[1]));
          }
        }
      }

      // Find current file completed chunks from logs
      for (let i = logs.length - 1; i >= 0; i--) {
        const match = logs[i].match(/Индексация чанка\s+(\d+)\/(\d+)/);
        if (match) {
          currentFileCompleted = parseInt(match[1]);
          currentFileTotal = parseInt(match[2]);
          break;
        }
      }

      // 3. Estimate average chunks per file
      const avgChunksPerFile = processedFilesChunks.length > 0
        ? processedFilesChunks.reduce((a, b) => a + b, 0) / processedFilesChunks.length
        : 50; // default baseline: 50 chunks/file

      // 4. Calculate remaining files in queue
      const remainingFiles = Math.max(0, progressTotal - progressCurrent - (currentFileTotal > 0 ? 1 : 0));

      // 5. Total remaining chunks
      const remainingChunksInCurrent = Math.max(0, currentFileTotal - currentFileCompleted);
      const estimatedRemainingChunks = remainingChunksInCurrent + (remainingFiles * avgChunksPerFile);

      // 6. Remaining time
      let remainingTime = estimatedRemainingChunks * avgChunkDuration;

      // Add baseline PDF OCR overhead if currently OCR-ing a PDF (not yet chunked)
      let isPdfOcrActive = false;
      if (logs.length > 0) {
        const lastLog = logs[logs.length - 1];
        if (lastLog.includes("Векторизация:") && lastLog.toLowerCase().includes(".pdf")) {
          isPdfOcrActive = true;
        }
      }
      if (isPdfOcrActive) {
        remainingTime += 10;
      }

      // Add baseline PDF OCR overhead for remaining PDFs in queue
      let remainingPDFs = 0;
      Object.entries(sources).forEach(([url, src]) => {
        if (src.status === "downloaded") {
          const isPdf = url.toLowerCase().endsWith(".pdf") || src.title.toLowerCase().includes(".pdf");
          if (isPdf) remainingPDFs++;
        }
      });
      if (isPdfOcrActive) remainingPDFs = Math.max(0, remainingPDFs - 1);
      remainingTime += remainingPDFs * 10;

      setEstimatedTimeRemaining(Math.round(remainingTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [isVectorizing, progressCurrent, progressTotal, logs, sources]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isDownloading, isVectorizing]);

  // Update vectorization progress from logs
  useEffect(() => {
    if (isVectorizing) {
      for (const log of logs) {
        const match = log.match(/Найдено файлов для векторизации:\s*(\d+)/);
        if (match) {
          setProgressTotal(parseInt(match[1]));
        }
      }
      let count = 0;
      for (const log of logs) {
        if (log.includes("успешно проиндексирован") || log.includes("Ошибка векторизации") || log.includes("ошибка векторизации")) {
          count++;
        }
      }
      if (count > 0) {
        setProgressCurrent(count);
      }
    }
  }, [logs, isVectorizing]);


  // 1. Load sources list on mount
  const loadSources = async () => {
    try {
      const res = await fetch(`/api/parser/sources?t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setSources(data.sources || {});
        setPendingCount(data.pendingCount || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load sources queue:", err);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  // 2. Add source manually
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    try {
      const res = await fetch("/api/parser/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, status: "queued" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSources(data.sources);
        const addedUrl = newUrl;
        setNewUrl("");
        handleSelectSource(addedUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Add discovered link to sources
  const handleAddDiscoveredLink = async (link: DiscoveredLink) => {
    try {
      const res = await fetch("/api/parser/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: link.url, 
          title: link.title.replace("HTML: ", ""), 
          status: "queued",
          parentUrl: selectedUrl 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSources(data.sources);
      }
    } catch (err) {
      console.error("Failed to add sub-link:", err);
    }
  };

  // 4. Delete source
  const handleDeleteSource = async (urlToDelete: string) => {
    try {
      const res = await fetch("/api/parser/sources", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToDelete }),
      });
      const data = await res.json();
      if (res.ok) {
        setSources(data.sources);
        if (selectedUrl === urlToDelete) {
          setSelectedUrl(null);
          setScanResult(null);
          setParentText("");
        }
        // Remove from cache too
        setScannedCache(prev => {
          const updated = { ...prev };
          delete updated[urlToDelete];
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Scan URL
  const triggerScan = async (url: string, forceScan: boolean = false, silent: boolean = false) => {
    if (!silent) {
      setIsScanning(true);
      setErrorMsg(null);
      setScanResult(null);
      setParentText("");
    }

    try {
      const response = await fetch("/api/parser/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, forceScan }),
      });

      const data = await response.json();

      if (response.ok) {
        const linksWithChecked = data.links.map((link: DiscoveredLink, idx: number) => ({
          ...link,
          originalIndex: idx,
          checked: link.checked ?? (link.status === "failed" ? true : (link.status ? false : link.type === "document")),
        }));
        setScanResult({
          title: data.title,
          extractedText: data.extractedText,
          links: linksWithChecked,
        });
        setParentText(data.extractedText);
        const hasText = !!data.extractedText && data.extractedText.trim().length > 0;
        setShouldIndexParent(hasText && !data.status);
        setParentStatus(data.status || null);
        
        // Save to cache
        setScannedCache(prev => ({
          ...prev,
          [url]: {
            title: data.title,
            extractedText: data.extractedText,
            links: linksWithChecked,
          }
        }));

        loadSources(); // reload to get the Scanned status updated
      } else {
        if (!silent) {
          setErrorMsg(data.error || "Произошла ошибка при сканировании страницы.");
        }
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setErrorMsg("Сетевая ошибка при сканировании. Проверьте адрес и попробуйте снова.");
      }
    } finally {
      if (!silent) {
        setIsScanning(false);
      }
    }
  };

  const handleSelectSource = (url: string) => {
    setSelectedUrl(url);
    setErrorMsg(null);

    if (scannedCache[url]) {
      const cached = scannedCache[url];
      setScanResult({
        title: cached.title,
        extractedText: cached.extractedText,
        links: cached.links,
      });
      setParentText(cached.extractedText);
    } else {
      setScanResult(null);
      setParentText("");
      triggerScan(url, false);
    }
  };

  const handleTextareaChange = (text: string) => {
    setParentText(text);
    if (selectedUrl && scannedCache[selectedUrl]) {
      setScannedCache(prev => ({
        ...prev,
        [selectedUrl]: {
          ...prev[selectedUrl],
          extractedText: text
        }
      }));
    }
  };

  const handleToggleLink = (index: number) => {
    if (!scanResult || !selectedUrl) return;
    const updatedLinks = [...scanResult.links];
    updatedLinks[index].checked = !updatedLinks[index].checked;
    
    setScanResult({
      ...scanResult,
      links: updatedLinks,
    });

    if (scannedCache[selectedUrl]) {
      setScannedCache(prev => ({
        ...prev,
        [selectedUrl]: {
          ...prev[selectedUrl],
          links: updatedLinks
        }
      }));
    }
  };

  const handleToggleAll = (type: "document" | "html_page", value: boolean) => {
    if (!scanResult || !selectedUrl) return;
    const updatedLinks = scanResult.links.map((link) => {
      if (link.type === type) {
        return { ...link, checked: value };
      }
      return link;
    });
    
    setScanResult({
      ...scanResult,
      links: updatedLinks,
    });

    if (scannedCache[selectedUrl]) {
      setScannedCache(prev => ({
        ...prev,
        [selectedUrl]: {
          ...prev[selectedUrl],
          links: updatedLinks
        }
      }));
    }
  };

  const handleGlobalVectorize = async () => {
    setIsVectorizing(true);
    setLogs(prev => [...prev, "⚡ Запуск векторизации...", "Установка соединения с сервером векторизации..."]);
    setProgressTotal(0);
    setProgressCurrent(0);
    vectorizeStartTimestampRef.current = Date.now();
    setErrorMsg(null);

    const controller = new AbortController();
    setVectorizeController(controller);

    try {
      const res = await fetch("/api/parser/vectorize", { 
        method: "POST",
        signal: controller.signal
      });
      if (!res.ok) {
        const text = await res.text();
        setErrorMsg(text || "Произошла ошибка векторизации.");
        setIsVectorizing(false);
        setVectorizeController(null);
        return;
      }
      
      const reader = res.body?.getReader();
      if (!reader) {
        setErrorMsg("Не удалось открыть поток логов.");
        setIsVectorizing(false);
        setVectorizeController(null);
        return;
      }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          buffer += chunk;
          const lines = buffer.split("\n");
          // Save the last incomplete line back to buffer
          buffer = lines.pop() || "";
          
          if (lines.length > 0) {
            setLogs(prev => [...prev, ...lines.filter(l => l.trim().length > 0)]);
          }
        }
      }

      if (buffer.trim()) {
        setLogs(prev => [...prev, buffer.trim()]);
      }
      
      loadSources();
    } catch (err: any) {
      if (err.name === "AbortError") {
        setLogs(prev => [...prev, "🛑 Векторизация прервана пользователем."]);
      } else {
        console.error(err);
        setErrorMsg("Сетевая ошибка при векторизации.");
      }
    } finally {
      setIsVectorizing(false);
      setVectorizeController(null);
    }
  };

  const handleStopVectorize = () => {
    if (vectorizeController) {
      vectorizeController.abort();
    }
  };

  const handleDownloadAndIndex = async () => {
    if (!selectedUrl) return;

    setIsDownloading(true);
    setLogs(prev => [...prev, "📥 Запуск скачивания ресурсов на сервере..."]);
    setErrorMsg(null);

    const selectedFiles = scanResult
      ? scanResult.links
          .filter((link) => link.checked)
          .map((link) => ({
            url: link.url,
            title: link.title,
            type: link.type,
          }))
      : [];

    try {
      const response = await fetch("/api/parser/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentUrl: selectedUrl,
          parentTitle: scanResult?.title || sources[selectedUrl]?.title || "Без названия",
          parentText: parentText,
          shouldIndexParent,
          selectedFiles,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLogs(prev => [...prev, ...(data.logs || ["Успешно обработано!"])]);
        loadSources();
        await triggerScan(selectedUrl, false, true);
      } else {
        setErrorMsg(data.error || "Произошла ошибка во время скачивания.");
        if (data.logs) {
          setLogs(prev => [...prev, ...(data.logs || [])]);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Ошибка сети при скачивании ресурсов.");
    } finally {
      setIsDownloading(false);
    }
  };

  const docs = scanResult
    ? [...scanResult.links]
        .map((l, idx) => ({ ...l, originalIndex: l.originalIndex ?? idx }))
        .filter((l) => l.type === "document")
        .sort((a, b) => {
          if (a.status === "failed" && b.status !== "failed") return -1;
          if (a.status !== "failed" && b.status === "failed") return 1;
          return 0;
        })
    : [];

  const pages = scanResult
    ? [...scanResult.links]
        .map((l, idx) => ({ ...l, originalIndex: l.originalIndex ?? idx }))
        .filter((l) => l.type === "html_page")
        .sort((a, b) => {
          if (a.status === "failed" && b.status !== "failed") return -1;
          if (a.status !== "failed" && b.status === "failed") return 1;
          return 0;
        })
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-2 pb-6 flex flex-col h-[calc(100dvh-6.5rem)] overflow-hidden">
      {/* Header */}
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад на главную
        </Link>
        <span className="text-xs text-slate-550 font-bold flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/40">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Режим Администрирования RAG
        </span>
      </div>

      {/* Main 3-Panel Layout */}
      <div className="w-full flex-grow bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-xl min-h-0 flex flex-col">
        <div className="w-full h-full overflow-hidden rounded-[23px] p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* PANEL 1: Left Queue Sidebar (col-span-3) */}
          <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-200/60 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6 flex flex-col space-y-4 h-full overflow-hidden min-h-0">
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Очередь краулинга</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Управляйте страницами для индексации</p>
            </div>

            {/* Global Vectorize Banner */}
            {pendingCount > 0 && (
              <div 
                onClick={() => setSelectedUrl(null)}
                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg space-y-2.5 cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Векторизация</span>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    Новых файлов: {pendingCount}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed opacity-95">
                  Загружено {pendingCount} новых файлов/статей. Запустите векторизацию для отправки в RAG.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    isVectorizing ? handleStopVectorize() : handleGlobalVectorize();
                  }}
                  className={`w-full py-1.5 rounded-xl font-extrabold text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm border ${
                    isVectorizing 
                      ? "bg-white hover:bg-rose-50 text-rose-600 dark:text-rose-500" 
                      : "bg-white hover:bg-slate-100 text-blue-700"
                  }`}
                >
                  {isVectorizing ? (
                    <>🛑 Остановить векторизацию</>
                  ) : (
                    <>⚡ Векторизовать новые данные</>
                  )}
                </button>
              </div>
            )}

            {/* Add URL form */}
            <form onSubmit={handleAddSource} className="flex gap-1.5">
              <input
                type="url"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Вставить ссылку..."
                className="flex-grow px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Добавить в очередь"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Sources queue list */}
            <div className="flex-grow overflow-y-auto space-y-2 pr-1.5 scrollbar-thin min-h-0 h-0">
              {Object.keys(sources).length === 0 ? (
                <div className="text-center py-8 text-xs font-semibold text-slate-400 flex flex-col items-center gap-2">
                  <HelpCircle className="w-8 h-8 text-slate-300" />
                  Очередь пуста.<br />Добавьте первый URL.
                </div>
              ) : (
                Object.entries(sources).reverse().map(([url, src]) => {
                  const isSelected = selectedUrl === url;

                  return (
                    <div 
                      key={url}
                      className={`group p-2.5 rounded-xl border transition-all flex items-start gap-2 justify-between cursor-pointer ${
                        isSelected 
                          ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60" 
                          : "bg-slate-50/30 hover:bg-slate-50/80 dark:bg-slate-950/10 dark:hover:bg-slate-950/30 border-slate-200/40 dark:border-slate-800"
                      }`}
                      onClick={() => handleSelectSource(url)}
                    >
                      <div className="min-w-0 flex-grow">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                          {src.title}
                        </p>
                        <span className="text-[9px] text-slate-400 truncate block font-medium mt-0.5" title={url}>
                          {url}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className={`inline-block text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                            src.status === "indexed"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : src.status === "downloaded"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : src.status === "scanned"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-slate-500/10 text-slate-550 dark:text-slate-400"
                          }`}>
                            {src.status === "indexed"
                              ? "В RAG"
                              : src.status === "downloaded"
                              ? "Скачан"
                              : src.status === "scanned"
                              ? "Просканирован"
                              : "В очереди"}
                          </span>
                          
                          {(() => {
                            const cachedSource = scannedCache[url];
                            const hasErrors = cachedSource 
                              ? cachedSource.links.some(l => l.checked && l.status === "failed")
                              : !!src.hasErrors;
                            return hasErrors ? (
                              <span className="inline-block text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                                Ошибка
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSource(url);
                        }}
                        className="text-slate-400 hover:text-red-505 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* MAIN AREA: Middle Editor & Right Discovered (col-span-9) */}
          <div className="lg:col-span-9 flex flex-col h-full overflow-hidden min-h-0 justify-between space-y-4">
            
            {/* Top Container */}
            <div 
              ref={topContainerRef}
              className="overflow-hidden flex flex-col flex-grow min-h-0 h-0"
            >
              {!selectedUrl ? (
                /* START PAGE / DASHBOARD */
                <div className="w-full h-full flex flex-col space-y-6 overflow-y-auto pr-1.5 scrollbar-thin">
                  <div className="p-6 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-800 rounded-3xl space-y-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <ShieldCheck className="w-5.5 h-5.5 text-blue-600" /> Управление Базой Знаний RAG
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Центральный пульт управления краулингом, скачиванием документов и индексацией в векторную базу данных Gemini.
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-2xl shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">КОЛ-ВО ИСТОЧНИКОВ</span>
                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1">
                          {stats.sourcesCount}
                        </span>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-2xl shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">КОЛ-ВО ОШИБОК</span>
                        <span className="text-2xl font-black text-red-555 block mt-1">
                          {stats.errorsCount}
                        </span>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-955 border border-slate-200/40 dark:border-slate-800 rounded-2xl shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">КОЛ-ВО СКАЧАННЫХ ФАЙЛОВ</span>
                        <span className="text-2xl font-black text-blue-600 block mt-1">
                          {stats.downloadedCount}
                        </span>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-2xl shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ИНДЕКСИРОВАНО (RAG)</span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                          {stats.indexedCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Action 1: Vectorization */}
                    <div className="p-6 border border-slate-200/50 dark:border-slate-800 rounded-3xl bg-slate-50/20 dark:bg-slate-950/10 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="inline-block mb-3.5 text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-900/40 text-blue-600 px-2.5 py-1 rounded-full">
                          Индексация в RAG
                        </span>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Глобальная векторизация</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium mt-2">
                          Запускает процесс конвертации всех локальных документов (.txt, .pdf, .docx, .html) в векторные эмбеддинги при помощи **OpenRouter (OpenAI) API** и сохраняет их в базу знаний.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={isVectorizing ? handleStopVectorize : handleGlobalVectorize}
                          className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                            isVectorizing
                              ? "bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 shadow-none"
                              : "bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-lg shadow-blue-500/10"
                          }`}
                        >
                          {isVectorizing ? (
                            <>
                              🛑 Остановить процесс векторизации
                            </>
                          ) : (
                            <>
                              ⚡ Запустить векторизацию ({pendingCount} новых)
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action 2: Guide */}
                    <div className="p-6 border border-slate-200/50 dark:border-slate-800 rounded-3xl bg-slate-50/20 dark:bg-slate-950/10 space-y-3">
                      <h3 className="text-xs font-extrabold uppercase text-slate-405 tracking-wider">Быстрое руководство</h3>
                      <ul className="space-y-2.5 text-xs text-slate-500 font-semibold leading-normal">
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 text-slate-700 dark:text-slate-300">1</span>
                          <span>Вставьте ссылку на страницу МВД слева и нажмите <b>+</b> для добавления.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 text-slate-700 dark:text-slate-300">2</span>
                          <span>Выберите добавленный источник, чтобы запустить автоматическое сканирование и извлечение документов.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 text-slate-700 dark:text-slate-300">3</span>
                          <span>Отметьте нужные файлы галочками и нажмите кнопку <b>Скачать</b>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 text-slate-700 dark:text-slate-300">4</span>
                          <span>После завершения скачивания запустите <b>Векторизацию</b>, чтобы загрузить данные в базу RAG.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                /* SOURCE SCANNER VIEW */
                <div className="w-full h-full flex flex-col min-h-0 h-0">
                  {isScanning && (
                    <div className="flex-grow flex flex-col items-center justify-center text-center py-12">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-350">Сканирование целевой страницы...</h4>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">
                        Бэкенд выполняет HEAD-запросы для определения скрытых документов без расширений.
                      </p>
                    </div>
                  )}

                  {!isScanning && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow h-0 overflow-hidden min-h-0 pb-4">
                      
                      {/* PANEL 2: Middle - Parent Text Editor (col-span-7) */}
                      <div className="lg:col-span-7 flex flex-col space-y-3 h-full overflow-hidden min-h-0">
                        <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 shrink-0">
                          <FileText className="w-3.5 h-3.5 text-blue-500" /> Текст основной статьи
                        </h3>

                        {errorMsg && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-2xl flex items-center justify-between shadow-sm shrink-0">
                            <span>⚠️ {errorMsg} (Вы можете вставить текст вручную)</span>
                            <button 
                              onClick={() => triggerScan(selectedUrl, true)}
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300 rounded text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              Повторить
                            </button>
                          </div>
                        )}

                        <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex-grow flex flex-col justify-between space-y-3 min-h-0 h-0">
                          <div className="flex-grow flex flex-col min-h-0 h-0">
                            <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-slate-200/40 dark:border-slate-800 shrink-0">
                              <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate" title={scanResult?.title || sources[selectedUrl]?.title || "Без названия"}>
                                {scanResult?.title || sources[selectedUrl]?.title || "Без названия"}
                              </h4>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <a
                                  href={selectedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 font-bold hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-[10px] inline-flex items-center gap-1 transition-colors select-none"
                                >
                                  Открыть оригинал <ExternalLink className="w-3 h-3" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => triggerScan(selectedUrl, true)}
                                  disabled={isScanning}
                                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 font-bold hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-[10px] select-none transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  Обновить
                                </button>
                              </div>
                            </div>
                            <textarea
                              value={parentText}
                              onChange={(e) => handleTextareaChange(e.target.value)}
                              className="w-full flex-grow text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold bg-white dark:bg-slate-950 p-3.5 border border-slate-200/40 dark:border-slate-800 focus:outline-none focus:border-blue-500 rounded-xl shadow-inner resize-none font-mono min-h-0 h-full"
                              placeholder="Текст статьи отсутствует."
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/35 dark:border-slate-800/80 shrink-0">
                            <button
                              type="button"
                              onClick={() => setShouldIndexParent(!shouldIndexParent)}
                              className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                            >
                              {shouldIndexParent ? (
                                <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                              Сохранить как .txt
                            </button>
                            {parentStatus === "indexed" ? (
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full select-none uppercase">
                                В RAG
                              </span>
                            ) : parentStatus === "downloaded" ? (
                              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full select-none uppercase">
                                Скачано
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* PANEL 3: Right - Discovered resources (col-span-5) */}
                      <div className="lg:col-span-5 flex flex-col space-y-3 h-full overflow-hidden min-h-0">
                        <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 shrink-0">
                          <Globe className="w-3.5 h-3.5 text-emerald-500" /> Найденные ресурсы
                        </h3>

                        <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex-grow flex flex-col space-y-4 min-h-0 h-0 overflow-hidden">
                          {!scanResult ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-4 py-8">
                              <Globe className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2 animate-pulse" />
                              <p className="text-xs font-bold text-slate-550">Поиск ресурсов не выполнен</p>
                              <p className="text-[10px] text-slate-400 max-w-xs mt-1">
                                Автоматический поиск ссылок недоступен из-за ошибки сканирования.
                              </p>
                            </div>
                          ) : (
                            <>
                              {/* Documents list */}
                              <div className="flex-grow space-y-2 flex flex-col h-1/2 overflow-hidden min-h-0">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase shrink-0">
                                  <span>Документы ({docs.length})</span>
                                  <div className="flex gap-2">
                                    <button type="button" onClick={() => handleToggleAll("document", true)} className="hover:text-blue-500 cursor-pointer">Все</button>
                                    <span>|</span>
                                    <button type="button" onClick={() => handleToggleAll("document", false)} className="hover:text-blue-500 cursor-pointer">Сбросить</button>
                                  </div>
                                </div>

                                <div className="flex-grow overflow-y-auto border border-slate-200/40 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-955 divide-y divide-slate-100 dark:divide-slate-900 shadow-inner scrollbar-thin min-h-0 h-0">
                                  {docs.length === 0 ? (
                                    <div className="p-4 text-xs font-medium text-slate-550 text-center">Документы не обнаружены.</div>
                                  ) : (
                                    docs.map((link) => {
                                      const origIdx = link.originalIndex ?? 0;
                                      return (
                                        <div key={origIdx} className="p-2 flex items-start gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                          <button
                                            type="button"
                                            onClick={() => handleToggleLink(origIdx)}
                                            className="mt-0.5 text-slate-500 cursor-pointer shrink-0"
                                          >
                                            {link.checked ? (
                                              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            ) : (
                                              <Square className="w-4 h-4" />
                                            )}
                                          </button>
                                          <div className="min-w-0 flex-grow">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={link.title}>{link.title}</p>
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-slate-500 dark:text-slate-400 hover:text-blue-500 flex items-center gap-1 font-semibold truncate mt-0.5">
                                              {link.url} <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                          </div>
                                          {link.status === "indexed" ? (
                                            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 select-none uppercase">
                                              В RAG
                                            </span>
                                          ) : link.status === "downloaded" ? (
                                            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 select-none uppercase">
                                              Скачан
                                            </span>
                                          ) : link.status === "failed" ? (
                                            <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 shrink-0 select-none flex items-center gap-0.5" title="Ошибка скачивания. Будет повторено при нажатии кнопки Скачать">
                                              <AlertTriangle className="w-3 h-3 text-red-500" /> Ошибка
                                            </span>
                                          ) : (
                                            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-500 dark:text-slate-400 shrink-0 select-none uppercase">
                                              DOC
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>

                              {/* Sub-pages list */}
                              <div className="flex-grow space-y-2 flex flex-col h-1/2 overflow-hidden min-h-0">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase shrink-0">
                                  <span>Связанные страницы ({pages.length})</span>
                                  <div className="flex gap-2">
                                    <button type="button" onClick={() => handleToggleAll("html_page", true)} className="hover:text-blue-500 cursor-pointer">Все</button>
                                    <span>|</span>
                                    <button type="button" onClick={() => handleToggleAll("html_page", false)} className="hover:text-blue-500 cursor-pointer">Сбросить</button>
                                  </div>
                                </div>

                                <div className="flex-grow overflow-y-auto border border-slate-200/40 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 divide-y divide-slate-100 dark:divide-slate-900 shadow-inner scrollbar-thin min-h-0 h-0">
                                  {pages.length === 0 ? (
                                    <div className="p-4 text-xs font-medium text-slate-500 text-center">Связанные страницы не обнаружены.</div>
                                  ) : (
                                    pages.map((link) => {
                                      const origIdx = link.originalIndex ?? 0;
                                      const isQueued = !!sources[link.url];

                                      return (
                                        <div key={origIdx} className="p-2 flex items-start gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors justify-between">
                                          <div className="min-w-0 flex-grow mr-2">
                                            <div className="flex items-center gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => handleToggleLink(origIdx)}
                                                className="text-slate-500 cursor-pointer shrink-0"
                                              >
                                                {link.checked ? (
                                                  <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                  <Square className="w-3.5 h-3.5" />
                                                )}
                                              </button>
                                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={link.title}>{link.title}</p>
                                            </div>
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-slate-500 dark:text-slate-400 hover:text-blue-500 flex items-center gap-1 font-semibold truncate mt-0.5 ml-5">
                                              {link.url} <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 shrink-0">
                                            {link.status === "indexed" ? (
                                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 select-none bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 className="w-3 h-3" /> В RAG
                                              </span>
                                            ) : link.status === "downloaded" ? (
                                              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 select-none bg-blue-500/10 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 className="w-3 h-3" /> Скачан
                                              </span>
                                            ) : link.status === "failed" ? (
                                              <span className="text-[9px] font-bold text-red-650 dark:text-red-400 flex items-center gap-0.5 select-none bg-red-500/10 px-2 py-0.5 rounded-full" title="Ошибка скачивания. Будет повторено при нажатии кнопки Скачать">
                                                <AlertTriangle className="w-3 h-3 text-red-550" /> Ошибка
                                              </span>
                                            ) : isQueued ? (
                                              <span className="text-[9px] font-bold text-slate-450 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                В очереди
                                              </span>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => handleAddDiscoveredLink(link)}
                                                className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[9px] cursor-pointer transition-colors"
                                              >
                                                Добавить
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom bar controls inside scanner view (only visible when not scanning) */}
                  {!isScanning && (
                    <div className="pt-2 pb-1 shrink-0">
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] text-slate-400 font-semibold">
                          {scanResult ? (
                            <span>Выбрано ресурсов для скачивания: {scanResult.links.filter(l => l.checked).length}</span>
                          ) : (
                            <span>Не удалось загрузить структуру страницы</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleDownloadAndIndex}
                          disabled={isDownloading || (!shouldIndexParent && !(scanResult?.links || []).some(l => l.checked))}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md shadow-blue-500/10"
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Скачивание...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" /> Скачать выбранное
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Section: Operations Log (Always visible) */}
            <div 
              ref={logsOuterRef}
              className="flex flex-col pt-3 border-t border-slate-200/60 dark:border-slate-800 h-36 shrink-0"
            >
              <div className="flex justify-between items-center select-none mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-blue-500" /> Журнал выполнения операций
                  </h4>
                  {progressTotal > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isVectorizing ? "text-blue-500 bg-blue-500/10 animate-pulse" : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"}`}>
                        Векторизовано: {progressCurrent} из {progressTotal} ({Math.round((progressCurrent / progressTotal) * 100)}%)
                      </span>
                      {isVectorizing && estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 && (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full">
                          Осталось ~{Math.floor(estimatedTimeRemaining / 60)}м {estimatedTimeRemaining % 60}с
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsLogsExpanded(!isLogsExpanded)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-450 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
                  title={isLogsExpanded ? "Свернуть журнал" : "Развернуть на весь экран"}
                >
                  {isLogsExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div 
                ref={logContainerRef} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[10px] leading-relaxed text-slate-200 overflow-y-auto space-y-1 shadow-inner select-text scrollbar-thin h-24"
              >
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-slate-500">[{index + 1}]</span>
                      <span className={log.includes("Ошибка") || log.includes("❌") ? "text-red-400" : log.includes("успешно") || log.includes("В RAG") ? "text-emerald-400" : "text-slate-200"}>
                        {log}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">Система готова. Ожидание операций...</div>
                )}
                {isDownloading && (
                  <div className="flex items-center gap-1 text-slate-400 animate-pulse">
                    <span>&gt;</span> Загрузка файлов во временное хранилище...
                  </div>
                )}
                {isVectorizing && (
                  <div className="flex items-center gap-1 text-slate-400 animate-pulse">
                    <span>&gt;</span> Вычисление векторных представлений и индексация в RAG...
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
