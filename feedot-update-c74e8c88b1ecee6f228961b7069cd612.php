<?php
    define('UPDATER_VERSION', '0.1.0');

    define('PRIVATE_NAME', '1eff21a67161e68d4476010680e0e7ba');
    define('PRIVATE_KEY', '41f4d0dbc4814826102ea6c36e1ce94c');

    define('UPDATER_HASH', 'c74e8c88b1ecee6f228961b7069cd612');

    define('FOLDER_NAME', '2e32560face91b58d22a63208af38c92');
    define('BUILD_FOLDER_NAME', '2e325');
    define('CONFIG_FOLDER_NAME', '60fac');
    define('SHARED_FOLDER_NAME', '0ff02e8ecb98e8b66ae44c2b729d0343');

    error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

    class FeedotException extends Exception
    {
        private $data = '';

        public function __construct($message, $data = null)
        {
            $this->data = $data;
            parent::__construct($message);
        }

        public function getData()
        {
            return $this->data;
        }
    }

    class Request {
        private $method;
        private $data;
        private $isDataValid;

        public function __construct()
        {
            $this->method = $_SERVER['REQUEST_METHOD'];
            $this->data = $this->getInput();
            $this->isDataValid = $this->validateInput($this->data);
        }

        private function getInput()
        {
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!is_array($data)) return null;

            $actions = isset($data['actions']) ? $data['actions'] : null;
            $privateKey = isset($data[PRIVATE_NAME]) ? $data[PRIVATE_NAME] : null;

            return array(
                'privateKey' => $privateKey,
                'actions' => $actions
            );
        }

        private function validateInput($input)
        {
            if (!is_array($input)) return false;

            if (!isset($input['actions'], $input['privateKey'])) return false;
            if (!is_array($input['actions'])) return false;

            foreach ($input['actions'] as $action) {
                if (!is_array($action)) return false;
                if (!isset($action['method'], $action['params'])) return false;
            }

            return true;
        }

        public function getData()
        {
            return $this->data;
        }

        public function checkDataValid()
        {
            return $this->isDataValid;
        }

        public function checkPrivateKeyValid()
        {
            return $this->isDataValid && $this->data['privateKey'] === PRIVATE_KEY;
        }

        public function checkMethod($method)
        {
            return strtoupper($method) === strtoupper($this->method);
        }
    }

    class Response {
        public function status($status)
        {
            switch ($status) {
                case 400:
                    header('HTTP/1.0 400 Bad Request');
                    break;

                case 403:
                    header('HTTP/1.0 403 Forbidden');
                    break;

                case 404:
                    header('HTTP/1.0 404 Not Found');
                    break;
            }
            return $this;
        }

        public function json($data)
        {
            header('Content-Type: application/json');
            $body = json_encode($data);
            print $body;
            exit();
        }

        public function send($str = '')
        {
            print $str;
            exit();
        }
    }

    class System {
        public function prepare()
        {
            ini_set('memory_limit', '100M');
        }

        public function getFileUploadMaxSize()
        {
            $maxSize = -1;

            $postMaxSize = $this->parseSize(ini_get('post_max_size'));
            if ($postMaxSize > 0) {
                $maxSize = $postMaxSize;
            }

            $uploadMax = $this->parseSize(ini_get('upload_max_filesize'));
            if ($uploadMax > 0 && $uploadMax < $maxSize) {
                $maxSize = $uploadMax;
            }

            return $maxSize;
        }

        public function getMemoryLimit()
        {
            return $this->parseSize(ini_get('memory_limit'));
        }

        private function parseSize($size)
        {
            $unit = preg_replace('/[^bkmgtpezy]/i', '', $size);
            $size = preg_replace('/[^0-9\.]/', '', $size);
            if ($unit) {
                return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
            } else {
                return round($size);
            }
        }
    }

    class PathResolver {
        private $siteRoot;
        private $shared;
        private $working;

        public function __construct() {
            $this->siteRoot = dirname(__FILE__);
            $this->shared = $this->combine($this->siteRoot, SHARED_FOLDER_NAME);
            $this->working = $this->combine($this->siteRoot, FOLDER_NAME);
        }

        public function combine() {
            $paths = func_get_args();
            if (!count($paths)) return '';

            $startsWithSeparator = in_array(substr($paths[0], 0, 1), array('\\', '/'));

            $filteredPaths = [];
            foreach ($paths as $path) {
                if (!is_string($path)) continue;
                $path = str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $path);
                $path = trim($path);
                $path = trim($path, DIRECTORY_SEPARATOR);
                if (strlen($path)) {
                    $filteredPaths[] = $path;
                }
            }

            $result = implode(DIRECTORY_SEPARATOR, $filteredPaths);
            if ($startsWithSeparator) {
                $result = DIRECTORY_SEPARATOR . $result;
            }

            return $result;
        }

        public function getSiteRootPath($relativePath = null) {
            return $this->combine($this->siteRoot, $relativePath);
        }

        public function getWorkingPath($relativePath = null)
        {
            return $this->combine($this->working, $relativePath);
        }

        public function getSharedPath($relativePath = null)
        {
            return $this->combine($this->shared, $relativePath);
        }

        public function getTmpPath($relativePath = null)
        {
            return $this->combine($this->working, 'tmp', $relativePath);
        }

        public function getBuildPath($relativePath = null)
        {
            return $this->combine($this->working, BUILD_FOLDER_NAME, $relativePath);
        }

        public function getConfigPath($relativePath = null)
        {
            return $this->combine($this->working, CONFIG_FOLDER_NAME, $relativePath);
        }

        public function getPathByDistName($dist, $relativePath = null) {
            switch ($dist) {
                case 'siteRoot':
                    return $this->getSiteRootPath($relativePath);
                case 'shared':
                    return $this->getSharedPath($relativePath);
                case 'config':
                    return $this->getConfigPath($relativePath);
                case 'build':
                    return $this->getBuildPath($relativePath);
                case 'tmp':
                    return $this->getTmpPath($relativePath);
            }
            return '';
        }

        public function getBaseName($path)
        {
            $name = basename($path);
            $chunks = explode('?', $name);
            return $chunks[0];
        }

        public function getRandomFileName($path)
        {
            return implode('.', array(uniqid('feedot'), time(), $this->getBaseName($path)));
        }

        public function getRandomFolderName() {
            return implode('.', array(uniqid('feedot'), time()));
        }

        public function getBackupFileName($path)
        {
            return $path . '.' . $this->getRandomFolderName() . '.backup';
        }

        public function getExtractFileName($path)
        {
            return $path . '.extract';
        }
    }

    class FileManager {
        private $pathResolver;

        public function __construct($params) {
            $this->pathResolver = $params['pathResolver'];
        }

        public function getFolderFiles($dist)
        {
            $folderPath = $this->pathResolver->getPathByDistName($dist);
            $filesTree = $this->dirToArray($folderPath);
            $filesList = $this->treeToPaths($filesTree, $folderPath);

            $filesHashes = array();
            foreach ($filesList as $filePath) {
                $filesHashes[$filePath] = md5_file($filePath);
            }

            return $filesHashes;
        }

        public function extract($filePath, $removeAfterExtract = false)
        {
            $extractFileName = $this->pathResolver->getExtractFileName($this->pathResolver->getBaseName($filePath));
            $extractFolder = $this->pathResolver->getTmpPath($extractFileName);
            $this->remove($extractFolder);
            $phar = new PharData($filePath);
            $phar->extractTo($extractFolder);
            if ($removeAfterExtract) {
                $this->remove($filePath);
            }
            return $extractFolder;
        }

        public function move($target, $dist)
        {
            if (!file_exists($target)) return false;
            if (file_exists($dist)) return false;

            if (!$this->createFolder(dirname($dist))) {
                return false;
            }
            return rename($target, $dist);
        }

        public function createFolder($path)
        {
            try {
                if (!file_exists($path)) {
                    return mkdir($path, 0755, true);
                } else if (!is_dir($path)) {
                    $this->remove($path);
                    return mkdir($path, 0755, true);
                } else {
                    return true;
                }
            } catch (Exception $e) {
                return false;
            }
        }

        public function remove($target)
        {
            if (is_dir($target)) {
                return $this->removeFolder($target);
            } else {
                return $this->removeFile($target);
            }
        }

        public function replace($target, $dist)
        {
            $backupPath = $this->pathResolver->getBackupFileName($dist);
            $this->remove($backupPath);
            $this->move($dist, $backupPath);
            if (!$this->move($target, $dist)) {
                $this->move($backupPath, $dist);
                $this->remove($backupPath);
                return false;
            }
            $this->remove($backupPath);
            return true;
        }

        public function clearFolder($target)
        {
            if (!is_dir($target)) return false;

            $dir = opendir($target);
            while(($file = readdir($dir)) !== false) {
                if (($file !== '.') && ($file !== '..')) {
                    $full = $target . '/' . $file;
                    if (is_dir($full)) {
                        $this->removeFolder($full);
                    } else {
                        $this->removeFile($full);
                    }
                }
            }
            closedir($dir);

            return true;
        }


        private function removeFile($target)
        {
            if (!file_exists($target)) return false;
            return unlink($target);
        }

        private function removeFolder($target)
        {
            if ($this->clearFolder($target)) {
                return rmdir($target);
            }

            return true;
        }

        private function dirToArray($dir)
        {
            $result = array();

            $cdir = scandir($dir);
            foreach ($cdir as $key => $value) {
                if (!in_array($value,array('.', '..'))) {
                    if (is_dir($dir . DIRECTORY_SEPARATOR . $value)) {
                        $result[] = array(
                            'name' => $value,
                            'sub' => $this->dirToArray($dir . DIRECTORY_SEPARATOR . $value)
                        );
                    } else {
                        $result[] = array(
                            'name' => $value
                        );
                    }
                }
            }

            return $result;
        }

        private function treeToPaths($tree, $current = '')
        {
            $result = array();
            foreach ($tree as $key => $item) {
                $path = $current ? ($current . DIRECTORY_SEPARATOR . $item['name']) : $item['name'];
                if (isset($item['sub'])) {
                    $r = $this->treeToPaths($item['sub'], $path);
                    $result = array_merge($result, $r);
                } else {
                    $result[] = $path;
                }
            }
            return $result;
        }
    }

    class DownloadManager {
        private $pathResolver;
        private $fileManager;

        public function __construct($params) {
            $this->pathResolver = $params['pathResolver'];
            $this->fileManager = $params['fileManager'];
        }

        private function validateUrl($url) {
            $whiteList = [
                'feedot.com',
                'info-static.ru',
                'cloud-cdn.ru',
                'pravoved.ru',
                'info-app.ru',
                'info-app2.ru',
                'info-app5shs.ru'
            ];
            foreach ($whiteList as $whiteHost) {
                $escapedWhiteHost = preg_quote($whiteHost);
                $regex = "/^https?:\\/\\/([a-z0-9-]+\\.)*$escapedWhiteHost\\//";
                if (preg_match($regex, $url) === 1) {
                    return true;
                }
            }
            return false;
        }

        public function downloadFile($url)
        {
            if (!$this->validateUrl($url)) {
                return array(
                    'url' => $url,
                    'success' => false,
                    'errorCode' => -1,
                    'error' => 'invalidHost'
                );
            }

            $fileName = $this->pathResolver->getRandomFileName($url);
            $tmpFilePath = $this->pathResolver->getTmpPath($fileName);

            $this->fileManager->remove($tmpFilePath);

            set_time_limit(0);
            $fp = fopen($tmpFilePath, 'wb');
            $ch = curl_init($url);
            curl_setopt_array($ch, array(
                CURLOPT_RETURNTRANSFER => 1,
                CURLOPT_FILE => $fp,
                CURLOPT_TIMEOUT => 60,
                CURLOPT_HEADER => 0,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
            ));
            curl_exec($ch);

            $errno = curl_errno($ch);
            $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $errMessage = curl_error($ch);

            curl_close($ch);
            fclose($fp);

            if ($errno || $statusCode !== 200) {
                $this->fileManager->remove($tmpFilePath);
                return array(
                    'success' => false,
                    'httpCode' => $statusCode,
                    'errorCode' => $errno,
                    'errorMessage' => $errMessage
                );
            } else {
                return array(
                    'success' => true,
                    'httpCode' => $statusCode,
                    'tmpFilePath' => $tmpFilePath,
                    'hash' => md5_file($tmpFilePath)
                );
            }
        }
    }

    class Handler {
        private $system;
        private $fileManager;
        private $downloadManager;
        private $pathResolver;

        public function __construct($params)
        {
            $this->system = $params['system'];
            $this->fileManager = $params['fileManager'];
            $this->downloadManager = $params['downloadManager'];
            $this->pathResolver = $params['pathResolver'];
        }

        public function validate()
        {
            $sharedFolderExists = is_dir($this->pathResolver->getSharedPath());
            $folderExists = is_dir($this->pathResolver->getWorkingPath());
            $tmpFolderExists = is_dir($this->pathResolver->getTmpPath());
            $buildFolderExists = is_dir($this->pathResolver->getBuildPath());
            $configFolderExists = is_dir($this->pathResolver->getConfigPath());

            $siteRootWritable = is_writable($this->pathResolver->getSiteRootPath());
            $sharedFolderWritable = $sharedFolderExists && is_writable($this->pathResolver->getSharedPath());
            $folderWritable = $folderExists && is_writable($this->pathResolver->getWorkingPath());
            $tmpFolderWritable = $tmpFolderExists && is_writable($this->pathResolver->getTmpPath());
            $buildFolderWritable = $buildFolderExists && is_writable($this->pathResolver->getBuildPath());
            $configFolderWritable = $configFolderExists && is_writable($this->pathResolver->getConfigPath());

            $fileUploadMaxSize = $this->system->getFileUploadMaxSize();
            $memoryLimit = $this->system->getMemoryLimit();
            $updaterHashSum = hash_file('md5', __FILE__);

            return array(
                'status' => 'success',
                'data' => array(
                    'version' => UPDATER_VERSION,
                    'updaterHash' => UPDATER_HASH,
                    'sharedFolderName' => SHARED_FOLDER_NAME,
                    'folderName' => FOLDER_NAME,
                    'configFolderName' => CONFIG_FOLDER_NAME,
                    'buildFolderName' => BUILD_FOLDER_NAME,

                    'sharedFolderExists' => $sharedFolderExists,
                    'folderExists' => $folderExists,
                    'tmpFolderExists' => $tmpFolderExists,
                    'buildFolderExists' => $buildFolderExists,
                    'configFolderExists' => $configFolderExists,

                    'siteRootWritable' => $siteRootWritable,
                    'sharedFolderWritable' => $sharedFolderWritable,
                    'folderWritable' => $folderWritable,
                    'tmpFolderWritable' => $tmpFolderWritable,
                    'buildFolderWritable' => $buildFolderWritable,
                    'configFolderWritable' => $configFolderWritable,

                    'os' => PHP_OS,
                    'osVersion' => php_uname(),
                    'fileUploadMaxSize' => $fileUploadMaxSize,
                    'memoryLimit' => $memoryLimit,
                    'phpVersion' => phpversion(),
                    'extensions' => get_loaded_extensions(),
                    'updaterHashSum' => $updaterHashSum
                )
            );
        }

        public function showFiles($params)
        {
            $this->system->prepare();
            if (!isset($params['dist']) || !in_array($params['dist'], ['shared', 'build', 'config', 'tmp'])) {
                throw new FeedotException('Invalid params');
            }
            return array(
                'status' => 'success',
                'data' => array(
                    'files' => $this->fileManager->getFolderFiles($params['dist'])
                ),
            );
        }

        public function downloadFile($params)
        {
            $this->system->prepare();
            set_time_limit(0);

            if (!isset($params['url'], $params['dist'], $params['fileName']) || !in_array($params['dist'], ['siteRoot', 'shared', 'build', 'config'])) {
                throw new FeedotException('Invalid params');
            }

            $distPath = $this->pathResolver->getPathByDistName($params['dist'], $params['fileName']);
            $fileExists = file_exists($distPath) && !is_dir($distPath);

            $result = array(
                'url' => $params['url'],
                'filePath' => $distPath,
                'fileExists' => $fileExists,
                'skip' => null,
                'verify' => null,
                'tmpFile' => null,
            );

            if (!empty($params['useCache']) && !empty($params['hash'])) {
                if ($fileExists && $params['hash'] === md5_file($distPath)) {
                    $result['skip'] = true;
                    return array(
                        'status' => 'success',
                        'data' => $result,
                    );
                } else {
                    $result['skip'] = false;
                }
            }

            $tmpFileData = $this->downloadManager->downloadFile($params['url']);
            $result['tmpFile'] = &$tmpFileData;

            if (!$tmpFileData['success']) {
                throw new FeedotException('Can\'t download file', $result);
            }

            if (!empty($params['verify']) && !empty($params['hash'])) {
                if ($tmpFileData['hash'] !== $params['hash']) {
                    $result['verify'] = false;
                    $this->fileManager->remove($tmpFileData['tmpFilePath']);
                    throw new FeedotException('Hash sum of downloaded file not match', $result);
                } else {
                    $result['verify'] = true;
                }
            }

            $replaceResult = $this->fileManager->replace($tmpFileData['tmpFilePath'], $distPath);
            if (!$replaceResult) {
                throw new FeedotException('Can\'t replace file', $result);
            }

            return array(
                'status' => 'success',
                'data' => $result,
            );
        }

        public function downloadFilesSet($params)
        {
            $this->system->prepare();
            set_time_limit(0);

            if (
                !isset($params['files'], $params['dist']) ||
                !in_array($params['dist'], ['shared', 'build', 'config']) ||
                !is_array($params['files'])
            ) {
                throw new FeedotException('Invalid params');
            }

            foreach ($params['files'] as $urlData) {
                if (!is_array($urlData) || !isset($urlData['url'], $urlData['fileName'])) {
                    throw new FeedotException('Invalid params');
                }
            }

            $tempFolderPath = $this->pathResolver->getTmpPath($this->pathResolver->getRandomFolderName());
            if (!$this->fileManager->createFolder($tempFolderPath)) {
                throw new FeedotException('Can\'t create temp folder', array(
                    'folderPath' => $tempFolderPath
                ));
            }

            $downloadedFiles = [];
            foreach ($params['files'] as $urlData) {
                $tmpFileData = $this->downloadManager->downloadFile($urlData['url']);

                $result = array(
                    'url' => $urlData['url'],
                    'verify' => null,
                    'tmpFile' => $tmpFileData,
                );

                if (!$tmpFileData['success']) {
                    $this->fileManager->remove($tempFolderPath);
                    throw new FeedotException('Can\'t download file', $result + array(
                        'downloadedFiles' => $downloadedFiles
                    ));
                }

                if (!empty($params['verify']) && !empty($urlData['hash'])) {
                    if ($tmpFileData['hash'] !== $urlData['hash']) {
                        $result['verify'] = false;
                        $this->fileManager->remove($tmpFileData['tmpFilePath']);
                        $this->fileManager->remove($tempFolderPath);
                        throw new FeedotException('Hash sum of downloaded file not match', $result + array(
                            'downloadedFiles' => $downloadedFiles
                        ));
                    } else {
                        $result['verify'] = true;
                    }
                }

                $tempFolderFilePath = $this->pathResolver->combine($tempFolderPath, $urlData['fileName']);

                $moveResult = $this->fileManager->move(
                    $tmpFileData['tmpFilePath'],
                    $tempFolderFilePath
                );
                if (!$moveResult) {
                    $this->fileManager->remove($tmpFileData['tmpFilePath']);
                    $this->fileManager->remove($tempFolderPath);
                    throw new FeedotException('Can\'t move file to folder', $result + array(
                        'downloadedFiles' => $downloadedFiles
                    ));
                }

                $tmpFileData['tmpFilePath'] = $tempFolderFilePath;

                $downloadedFiles[] = $result;
            }

            $distPath = $this->pathResolver->getPathByDistName($params['dist']);

            $this->fileManager->replace($tempFolderPath, $distPath);

            return array(
                'status' => 'success',
                'data' => array(
                    'files' => $downloadedFiles,
                ),
            );
        }

        public function downloadTarFile($params)
        {
            $this->system->prepare();
            set_time_limit(0);

            if (!isset($params['url'], $params['dist']) || !in_array($params['dist'], ['shared', 'build', 'config'])) {
                throw new Exception('invalidParams');
            }

            $distPath = $this->pathResolver->getPathByDistName($params['dist']);

            $result = array(
                'url' => $params['url'],
                'filePath' => $distPath,
                'verify' => null,
                'tmpFile' => null,
            );

            $tmpFileData = $this->downloadManager->downloadFile($params['url']);
            $result['tmpFile'] = &$tmpFileData;

            if (!$tmpFileData['success']) {
                throw new FeedotException('Can\'t download file', $result);
            }

            if (!empty($params['verify']) && !empty($params['hash'])) {
                if ($tmpFileData['hash'] !== $params['hash']) {
                    $result['verify'] = false;
                    $this->fileManager->remove($tmpFileData['tmpFilePath']);
                    throw new FeedotException('Hash sum of downloaded file not match', $result);
                } else {
                    $result['verify'] = true;
                }
            }

            $folderPath = $this->fileManager->extract($tmpFileData['tmpFilePath'], true);
            $tmpFileData['extractFolder'] = $folderPath;
            if (!$folderPath) {
                $this->fileManager->remove($tmpFileData['tmpFilePath']);
                throw new Exception('Can\'t extract file', $result);
            }

            $replaceResult = $this->fileManager->replace($folderPath, $distPath);
            if (!$replaceResult) {
                $this->fileManager->remove($folderPath);
                throw new FeedotException('Can\'t replace folder', $result);
            }

            return array(
                'status' => 'success',
                'data' => $result,
            );
        }

        public function clear() {
            $this->system->prepare();

            if (!isset($params['dist']) || !in_array($params['dist'], ['tmp', 'shared', 'build', 'config'])) {
                throw new Exception('invalidParams');
            }

            $distPath = $this->pathResolver->getPathByDistName($params['dist']);
            $this->fileManager->clearFolder($distPath);

            return array(
                'status' => 'success',
                'data' => array(
                    'dist' => $distPath,
                ),
            );
        }

        public function updateSelf() {
            $updateFileName = basename(__FILE__);
            if (preg_match('/^feedot-update-.+\.update.php$/', $updateFileName) === 1) {
                $fileName = preg_replace('/\.update\.php$/', '.php', $updateFileName);
                $distName = $this->pathResolver->getSiteRootPath($fileName);
                $copyResult = copy(__FILE__, $distName);

                if (!$copyResult) {
                    throw new FeedotException('Can\'t replace updater', array(
                        'filePath' => __FILE__,
                        'dist' => $distName
                    ));
                }

                return array(
                    'status' => 'success',
                    'data' => array(
                        'filePath' => __FILE__,
                        'dist' => $distName
                    ),
                );
            } else {
                throw new FeedotException('Current file is not an update file');
            }
        }
    }


    $system = new System();
    $request = new Request();
    $response = new Response();
    $pathResolver = new PathResolver();
    $fileManager = new FileManager(array(
        'pathResolver' => $pathResolver
    ));
    $downloadManager = new DownloadManager(array(
        'pathResolver' => $pathResolver,
        'fileManager' => $fileManager
    ));
    $handler = new Handler(array(
        'system' => $system,
        'pathResolver' => $pathResolver,
        'fileManager' => $fileManager,
        'downloadManager' => $downloadManager
    ));

    if ($request->checkMethod('GET')) {
        $response->json(array(
            'version' => UPDATER_VERSION,
            'feedot' => true,
        ));
    }
    if (!$request->checkMethod('POST')) {
        $response->status(403)->json(array(
            'error' => 'invalidRequest',
            'message' => 'Only POST is allowed'
        ));
    }
    if (!$request->checkDataValid()) {
        $response->status(403)->json(array(
            'error' => 'invalidRequest',
            'message' => 'Data is not valid'
        ));
    }

    if (!$request->checkPrivateKeyValid()) {
        $response->status(403)->json(array(
            'error' => 'invalidRequest',
            'message' => 'Data is not valid'
        ));
    }

    $fileManager->createFolder($pathResolver->getSharedPath());
    $fileManager->createFolder($pathResolver->getWorkingPath());
    $fileManager->createFolder($pathResolver->getTmpPath());
    $fileManager->createFolder($pathResolver->getBuildPath());
    $fileManager->createFolder($pathResolver->getConfigPath());

    $data = $request->getData();

    foreach ($data['actions'] as $action) {
        if (!method_exists($handler, $action['method'])) {
            $response->status(403)->json(array(
                'error' => 'invalidMethod',
                'message' => 'Method is not valid'
            ));
        }
    }

    $result = array();
    $hasError = false;

    foreach ($data['actions'] as $action) {
        $actionMethod = $action['method'];
        $actionParams = $action['params'];
        try {
            $result[] = array(
                'action' => $action,
                'result' => $handler->$actionMethod($actionParams)
            );
            
        } catch (FeedotException $e) {
            $hasError = true;
            $result[] = array(
                'action' => $action,
                'result' => array(
                    'status' => 'error',
                    'error' => 'exception',
                    'message' => $e->getMessage(),
                    'data' => $e->getData(),
                    'trace' => $e->getTrace()
                )
            );
        } catch (Exception $e) {
            $hasError = true;
            $result[] = array(
                'action' => $action,
                'result' => array(
                    'status' => 'error',
                    'error' => 'exception',
                    'message' => $e->getMessage(),
                    'trace' => $e->getTrace(),
                )
            );
        }
    }

    if ($hasError) {
        $response->status(400)->json(array(
            'error' => 'executeError',
            'message' => 'One or more actions failed',
            'data' => $result,
        ));
    } else {
        $response->json($result);
    }
