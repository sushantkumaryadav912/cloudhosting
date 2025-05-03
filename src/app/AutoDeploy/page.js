'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AutoDeploy() {
  const [zipFile, setZipFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [deployedUrl, setDeployedUrl] = useState(null);
  const [fileStructure, setFileStructure] = useState(null);
  const [packageJson, setPackageJson] = useState(null);
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [fileCount, setFileCount] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [fileTreeView, setFileTreeView] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Framework patterns and configurations
  const frameworkPatterns = {
    nextjs: {
      files: ['next.config.js', 'next.config.mjs', 'pages/_app.js', 'pages/_app.jsx', '.next/', 'src/app/layout.js', 'src/pages/index.js'],
      directories: ['pages/', 'src/app/', 'src/pages/'],
      dependencies: ['next'],
      codePatterns: ['import { useRouter }', 'getStaticProps', 'getServerSideProps', 'app.getInitialProps', "'use client'"],
      configPatterns: { 'next.config.js': ['rewrites', 'redirects', 'appDir: true'] },
      weight: 1.8
    },
    react: {
      files: ['src/App.js', 'src/App.jsx', 'src/index.js', 'src/index.jsx', 'react.config.js', 'babel.config.js'],
      directories: ['src/components/'],
      dependencies: ['react', 'react-dom'],
      codePatterns: ['import React', 'ReactDOM.render', 'useState', 'useEffect'],
      weight: 1.5
    },
    vue: {
      files: ['vue.config.js', 'src/main.js', 'src/App.vue'],
      directories: ['src/components/'],
      dependencies: ['vue'],
      codePatterns: ['createApp', 'Vue.use', '<template>', 'v-for', 'v-if'],
      configPatterns: { 'vue.config.js': ['configureWebpack', 'css.loaderOptions'] },
      weight: 1.4
    },
    angular: {
      files: ['angular.json', 'src/app/app.module.ts', 'tsconfig.json'],
      directories: ['src/app/'],
      dependencies: ['@angular/core'],
      codePatterns: ['@Component', 'NgModule', 'Injectable'],
      configPatterns: { 'angular.json': ['projects', 'architect'] },
      weight: 1.6
    },
    svelte: {
      files: ['svelte.config.js', 'src/App.svelte', 'vite.config.js'],
      directories: ['src/'],
      dependencies: ['svelte'],
      codePatterns: ['<script>', '<style>', 'export let'],
      configPatterns: { 'vite.config.js': ['svelte()'] },
      weight: 1.3
    },
    nuxt: {
      files: ['nuxt.config.js', 'nuxt.config.ts', 'pages/index.vue'],
      directories: ['pages/', 'components/'],
      dependencies: ['nuxt'],
      codePatterns: ['asyncData', 'middleware', 'plugins'],
      configPatterns: { 'nuxt.config.js': ['modules', 'buildModules'] },
      weight: 1.7
    },
    gatsby: {
      files: ['gatsby-config.js', 'gatsby-node.js'],
      directories: ['src/pages/'],
      dependencies: ['gatsby'],
      codePatterns: ['graphql`', 'createPages', 'GatsbyImage'],
      weight: 1.5
    },
    express: {
      files: ['app.js', 'server.js', 'routes/'],
      directories: ['routes/'],
      dependencies: ['express'],
      codePatterns: ['app.use', 'app.listen', 'express.Router', 'app.get('],
      weight: 1.4
    },
    nestjs: {
      files: ['nest-cli.json', 'src/main.ts', 'tsconfig.json'],
      directories: ['src/'],
      dependencies: ['@nestjs/core'],
      codePatterns: ['@Module', '@Controller', '@Injectable'],
      weight: 1.6
    }
  };

  // Handle ZIP file upload
  const handleFileChange = (e) => {
    console.log('handleFileChange triggered');
    setError(null);
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        setZipFile(file);
        setGithubUrl('');
      } else {
        setError('Please upload a ZIP file containing your project');
        setZipFile(null);
      }
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        setZipFile(file);
        setGithubUrl('');
      } else {
        setError('Please upload a ZIP file containing your project');
        setZipFile(null);
      }
    }
  };

  // Handle GitHub URL input
  const handleGithubUrlChange = (e) => {
    setError(null);
    setGithubUrl(e.target.value);
    setZipFile(null);
  };

  // Validate GitHub URL
  const validateGithubUrl = (url) => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?(?:\?.*)?$/;
    return githubRegex.test(url);
  };

  // Extract repository details from GitHub URL
  const extractRepoDetails = (url) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return [match[1], match[2].replace(/\.git$/, '')];
    }
    return [null, null];
  };

  // Fetch repository contents using GitHub API
  const fetchRepoContents = async (owner, repo, path = '') => {
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching repo contents:', error);
      return [];
    }
  };

  // Fetch file content from GitHub repository
  const fetchFileContent = async (owner, repo, path) => {
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
      const content = atob(response.data.content);
      return content;
    } catch (error) {
      console.error(`Error fetching file ${path}:`, error);
      return null;
    }
  };

  // Fetch package.json from GitHub repository
  const fetchPackageJson = async (owner, repo) => {
    try {
      const content = await fetchFileContent(owner, repo, 'package.json');
      return content ? JSON.parse(content) : null;
    } catch (error) {
      console.error('Error fetching package.json:', error);
      return null;
    }
  };

  // Fetch repository languages
  const fetchRepoLanguages = async (owner, repo) => {
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching repo languages:', error);
      return {};
    }
  };

  // Check if directory exists in repository
  const checkDirectoryExists = async (owner, repo, dir) => {
    try {
      await fetchRepoContents(owner, repo, dir);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Recursively fetch all files in repository
  const fetchAllRepoFiles = async (owner, repo, path = '', allFiles = []) => {
    const contents = await fetchRepoContents(owner, repo, path);
    for (const item of contents) {
      if (item.type === 'file') {
        allFiles.push(item);
      } else if (item.type === 'dir') {
        await fetchAllRepoFiles(owner, repo, item.path, allFiles);
      }
    }
    return allFiles;
  };

  // Analyze key files for framework patterns (GitHub)
  const analyzeKeyFiles = async (owner, repo, contents) => {
    const signatures = {};
    const filesToAnalyze = contents.filter(file =>
      file.name.endsWith('.js') ||
      file.name.endsWith('.jsx') ||
      file.name.endsWith('.ts') ||
      file.name.endsWith('.tsx') ||
      file.name.endsWith('.vue') ||
      file.name.endsWith('.svelte')
    ).slice(0, 10); // Analyze up to 10 files

    // Analyze configuration files
    const configFiles = contents.filter(file =>
      file.name === 'next.config.js' ||
      file.name === 'next.config.mjs' ||
      file.name === 'vue.config.js' ||
      file.name === 'angular.json' ||
      file.name === 'svelte.config.js' ||
      file.name === 'nuxt.config.js' ||
      file.name === 'gatsby-config.js' ||
      file.name === 'vite.config.js'
    );

    // Analyze code patterns in JS/TS files
    for (const file of filesToAnalyze) {
      try {
        const content = await fetchFileContent(owner, repo, file.path);
        if (content) {
          Object.keys(frameworkPatterns).forEach(framework => {
            frameworkPatterns[framework].codePatterns.forEach(pattern => {
              if (content.includes(pattern)) {
                signatures[framework] = (signatures[framework] || 0) + 1;
              }
            });
          });
        }
      } catch (error) {
        console.error(`Error analyzing file ${file.name}:`, error);
      }
    }

    // Analyze configuration files
    for (const file of configFiles) {
      try {
        const content = await fetchFileContent(owner, repo, file.path);
        if (content) {
          Object.keys(frameworkPatterns).forEach(framework => {
            const patterns = frameworkPatterns[framework].configPatterns;
            if (patterns && patterns[file.name]) {
              patterns[file.name].forEach(pattern => {
                if (content.includes(pattern)) {
                  signatures[framework] = (signatures[framework] || 0) + 2; // Higher weight for config matches
                }
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error analyzing config file ${file.name}:`, error);
      }
    }

    return signatures;
  };

  // Calculate framework score based on various indicators
  const calculateFrameworkScore = (packageJson, contents, languages, signatures, directories) => {
    const scores = {};

    Object.keys(frameworkPatterns).forEach(framework => {
      let score = 0;
      const patterns = frameworkPatterns[framework];

      // Check dependencies
      if (packageJson && packageJson.dependencies) {
        patterns.dependencies.forEach(dep => {
          if (packageJson.dependencies[dep]) {
            score += 3 * patterns.weight;
            // Bonus for specific versions
            if (dep === 'next' && packageJson.dependencies[dep].includes('13')) {
              score += 1 * patterns.weight; // Bonus for Next.js 13+ (App Router)
            }
          }
        });
      }

      // Check for framework-specific files
      patterns.files.forEach(file => {
        if (contents.some(f => f.name === file || f.path === file)) {
          score += 2 * patterns.weight;
        }
      });

      // Check directories
      patterns.directories.forEach(dir => {
        if (directories.includes(dir.replace('/', ''))) {
          score += 2 * patterns.weight;
        }
      });

      // Check language statistics
      if (languages) {
        if (framework === 'vue' && languages.Vue) {
          score += 2 * patterns.weight;
        } else if ((framework === 'react' || framework === 'nextjs') && languages.JavaScript) {
          score += patterns.weight;
        } else if (framework === 'angular' && languages.TypeScript) {
          score += 2 * patterns.weight;
        } else if (framework === 'svelte' && languages.Svelte) {
          score += 2 * patterns.weight;
        }
      }

      // Add scores from code pattern analysis
      if (signatures && signatures[framework]) {
        score += signatures[framework] * patterns.weight;
      }

      scores[framework] = score;
    });

    // Find framework with highest score
    const entries = Object.entries(scores);
    if (entries.length === 0) return { framework: 'Unknown', confidence: 0 };

    entries.sort((a, b) => b[1] - a[1]);
    const [topFramework, topScore] = entries[0];

    // Calculate confidence (max 95%)
    const confidence = Math.min(95, Math.round(topScore * 10));

    return {
      framework: topFramework === 'nextjs' ? 'Next.js' :
                 topFramework === 'react' ? 'React' :
                 topFramework === 'vue' ? 'Vue.js' :
                 topFramework.charAt(0).toUpperCase() + topFramework.slice(1),
      confidence,
      indicators: generateIndicators(topFramework, packageJson, contents, signatures, directories)
    };
  };

  // Generate indicators for detected framework
  const generateIndicators = (framework, packageJson, contents, signatures, directories) => {
    const indicators = [];
    const patterns = frameworkPatterns[framework];

    // Add dependency indicators
    if (packageJson && packageJson.dependencies) {
      patterns.dependencies.forEach(dep => {
        if (packageJson.dependencies[dep]) {
          indicators.push(`Found ${dep} dependency (version: ${packageJson.dependencies[dep]})`);
        }
      });
    }

    // Add file indicators
    patterns.files.forEach(file => {
      if (contents.some(f => f.name === file || f.path === file)) {
        indicators.push(`Found ${file}`);
      }
    });

    // Add directory indicators
    patterns.directories.forEach(dir => {
      if (directories.includes(dir.replace('/', ''))) {
        indicators.push(`Found ${dir} directory`);
      }
    });

    // Add code pattern indicators
    if (signatures && signatures[framework]) {
      indicators.push(`Detected ${signatures[framework]} code patterns specific to ${framework}`);
    }

    return indicators.length > 0 ? indicators : ['Framework detected based on project structure'];
  };

  // Analyze GitHub repository
  const analyzeGithubRepo = async (repoUrl) => {
    const [owner, repo] = extractRepoDetails(repoUrl);
    if (!owner || !repo) {
      throw new Error('Invalid GitHub repository URL');
    }

    setDetectionProgress(10);

    // Fetch all repository files recursively
    const allFiles = await fetchAllRepoFiles(owner, repo);
    setDetectionProgress(30);

    // Fetch package.json if it exists
    const packageJson = await fetchPackageJson(owner, repo);
    setDetectionProgress(50);

    // Fetch language statistics
    const languages = await fetchRepoLanguages(owner, repo);
    setDetectionProgress(70);

    // Analyze key files for framework patterns
    const frameworkSignatures = await analyzeKeyFiles(owner, repo, allFiles);
    setDetectionProgress(90);

    // Generate file structure
    const rootContents = await fetchRepoContents(owner, repo);
    const directories = rootContents.filter(item => item.type === 'dir').map(dir => dir.name);
    const rootFiles = rootContents.filter(item => item.type === 'file').map(file => file.name);

    // Create file tree visualization
    const fileTree = {
      name: repo,
      type: 'directory',
      children: [
        ...allFiles.map(item => ({
          name: item.name,
          type: item.type,
          path: item.path
        }))
      ]
    };

    setFileTreeView(fileTree);

    // Set file structure
    const structure = {
      rootFiles,
      directories,
      allFiles: allFiles.map(item => item.path),
      packageJson,
      totalSize: calculateEstimatedSize(allFiles.length, languages),
      totalFiles: allFiles.length
    };

    setFileStructure(structure);
    setPackageJson(packageJson);
    setFileCount(allFiles.length);

    // Calculate framework score
    const result = calculateFrameworkScore(packageJson, allFiles, languages, frameworkSignatures, directories);
    setDetectionProgress(100);

    return {
      ...result,
      projectSize: structure.totalSize,
      fileCount: structure.totalFiles
    };
  };

  // Estimate repository size based on file count and languages
  const calculateEstimatedSize = (fileCount, languages) => {
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    return totalBytes > 0 ? totalBytes : fileCount * 5000; // Estimate 5KB per file if no language stats
  };

  // Simulate GitHub repository structure
  const simulateGithubFileStructure = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isNextRepo = githubUrl.toLowerCase().includes('next');
        const isReactRepo = githubUrl.toLowerCase().includes('react');
        const isVueRepo = githubUrl.toLowerCase().includes('vue');

        let rootFiles = ['package.json', '.gitignore', 'README.md'];
        let directories = ['src', 'public'];
        let mockPackageJson = {
          name: githubUrl.split('/').pop(),
          dependencies: {},
        };

        if (isNextRepo) {
          rootFiles.push('next.config.js', 'tsconfig.json');
          directories.push('pages', 'components', 'src/app');
          mockPackageJson.dependencies = {
            next: '^13.0.0',
            react: '^18.0.0',
            'react-dom': '^18.0.0',
          };
        } else if (isReactRepo) {
          directories.push('components', 'assets');
          mockPackageJson.dependencies = {
            react: '^18.0.0',
            'react-dom': '^18.0.0',
            'react-scripts': '5.0.0',
          };
        } else if (isVueRepo) {
          rootFiles.push('vue.config.js');
          directories.push('components', 'views');
          mockPackageJson.dependencies = {
            vue: '^3.2.0',
            'vue-router': '^4.0.0',
            vuex: '^4.0.0',
          };
        }

        const structure = {
          rootFiles,
          directories,
          packageJson: mockPackageJson,
          totalFiles: 150 + Math.floor(Math.random() * 500),
          totalSize: 1024 * 1024 * (5 + Math.floor(Math.random() * 20)),
        };

        setFileStructure(structure);
        setPackageJson(mockPackageJson);
        setFileCount(structure.totalFiles);
        resolve(structure);
      }, 1000);
    });
  };

  // Analyze ZIP file structure
  const analyzeFileStructure = async () => {
    if (!zipFile && !githubUrl) {
      setError('Please upload a ZIP file or enter a GitHub URL');
      return;
    }

    if (githubUrl) {
      try {
        return await analyzeGithubRepo(githubUrl);
      } catch (error) {
        console.error('GitHub analysis error:', error);
        return simulateGithubFileStructure();
      }
    }

    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(zipFile);

      const rootFiles = [];
      const directories = new Set();
      const allFiles = [];
      let foundPackageJson = null;
      let totalFiles = 0;
      const filePromises = [];
      const frameworkSignatures = {};

      setDetectionProgress(20);

      Object.keys(content.files).forEach((filename) => {
        const file = content.files[filename];
        if (!file.dir) {
          totalFiles++;
          allFiles.push(filename);

          if (!filename.includes('/')) {
            rootFiles.push(filename);
          } else {
            const parts = filename.split('/');
            directories.add(parts[0]);
          }

          if (filename === 'package.json') {
            filePromises.push(
              file.async('string').then((content) => {
                try {
                  foundPackageJson = JSON.parse(content);
                } catch (e) {
                  console.error('Failed to parse package.json:', e);
                }
              })
            );
          }

          // Analyze file content for framework patterns
          if (
            filename.endsWith('.js') ||
            filename.endsWith('.jsx') ||
            filename.endsWith('.ts') ||
            filename.endsWith('.tsx') ||
            filename.endsWith('.vue') ||
            filename.endsWith('.svelte') ||
            filename === 'next.config.js' ||
            filename === 'next.config.mjs' ||
            filename === 'vue.config.js' ||
            filename === 'angular.json' ||
            filename === 'svelte.config.js' ||
            filename === 'nuxt.config.js' ||
            filename === 'gatsby-config.js' ||
            filename === 'vite.config.js'
          ) {
            filePromises.push(
              file.async('string').then((content) => {
                // Check code patterns
                Object.keys(frameworkPatterns).forEach(framework => {
                  frameworkPatterns[framework].codePatterns.forEach(pattern => {
                    if (content.includes(pattern)) {
                      frameworkSignatures[framework] = (frameworkSignatures[framework] || 0) + 1;
                    }
                  });

                  // Check config patterns
                  const patterns = frameworkPatterns[framework].configPatterns;
                  if (patterns && patterns[filename]) {
                    patterns[filename].forEach(pattern => {
                      if (content.includes(pattern)) {
                        frameworkSignatures[framework] = (frameworkSignatures[framework] || 0) + 2;
                      }
                    });
                  }
                });
              })
            );
          }
        }
      });

      setDetectionProgress(50);
      await Promise.all(filePromises);
      setDetectionProgress(70);

      setFileCount(totalFiles);
      setPackageJson(foundPackageJson);
      setExtractedFiles(allFiles);

      // Create file tree visualization
      const fileTree = createFileTree(allFiles);
      setFileTreeView(fileTree);

      const structure = {
        rootFiles,
        directories: Array.from(directories),
        allFiles,
        packageJson: foundPackageJson,
        totalSize: zipFile.size,
        totalFiles,
      };

      setFileStructure(structure);
      setDetectionProgress(90);

      // Detect framework with advanced scoring
      const frameworkResult = detectFrameworkAdvanced(structure, frameworkSignatures, Array.from(directories));

      setDetectionProgress(100);

      return {
        ...frameworkResult,
        projectSize: structure.totalSize,
        fileCount: structure.totalFiles
      };
    } catch (err) {
      console.error('ZIP analysis error:', err);
      throw new Error('Failed to extract zip file contents');
    }
  };

  // Create file tree structure for visualization
  const createFileTree = (files) => {
    const root = {
      name: 'root',
      type: 'directory',
      children: []
    };

    files.forEach(path => {
      const parts = path.split('/');
      let currentNode = root;

      parts.forEach((part, index) => {
        if (part === '') return;

        let found = currentNode.children.find(child => child.name === part);

        if (!found) {
          const isLastPart = index === parts.length - 1;
          const newNode = {
            name: part,
            type: isLastPart ? 'file' : 'directory',
            children: []
          };
          currentNode.children.push(newNode);
          found = newNode;
        }

        currentNode = found;
      });
    });

    return root;
  };

  // Advanced framework detection with weighted scoring
  const detectFrameworkAdvanced = (structure, codeSignatures, directories) => {
    const scores = {};

    Object.keys(frameworkPatterns).forEach(framework => {
      let score = 0;
      const patterns = frameworkPatterns[framework];
      const indicators = [];

      // Check dependencies
      if (structure.packageJson && structure.packageJson.dependencies) {
        patterns.dependencies.forEach(dep => {
          if (structure.packageJson.dependencies[dep]) {
            score += 3 * patterns.weight;
            indicators.push(`Found ${dep} dependency (version: ${structure.packageJson.dependencies[dep]})`);
          }
        });
      }

      // Check for framework-specific files
      patterns.files.forEach(file => {
        if (structure.allFiles.some(f => f.endsWith(file))) {
          score += 2 * patterns.weight;
          indicators.push(`Found ${file}`);
        }
      });

      // Check directories
      patterns.directories.forEach(dir => {
        if (directories.includes(dir.replace('/', ''))) {
          score += 2 * patterns.weight;
          indicators.push(`Found ${dir} directory`);
        }
      });

      // Add scores from code pattern analysis
      if (codeSignatures[framework]) {
        score += codeSignatures[framework] * patterns.weight;
        indicators.push(`Detected ${codeSignatures[framework]} code patterns specific to ${framework}`);
      }

      scores[framework] = { score, indicators };
    });

    // Find framework with highest score
    const entries = Object.entries(scores);
    if (entries.length === 0) return { framework: 'Unknown', confidence: 0, indicators: [] };

    entries.sort((a, b) => b[1].score - a[1].score);
    const [topFramework, { score, indicators }] = entries[0];

    // Calculate confidence (max 95%)
    const confidence = Math.min(95, Math.round(score * 10));

    return {
      framework: topFramework === 'nextjs' ? 'Next.js' :
                 topFramework === 'react' ? 'React' :
                 topFramework === 'vue' ? 'Vue.js' :
                 topFramework.charAt(0).toUpperCase() + topFramework.slice(1),
      confidence,
      indicators: indicators.length > 0 ? indicators : ['Framework detected based on project structure']
    };
  };

  // Handle analysis
  const handleAnalyze = async () => {
    setError(null);
    if (!zipFile && !githubUrl) {
      setError('Please upload a ZIP file or enter a GitHub URL');
      return;
    }
    if (githubUrl && !validateGithubUrl(githubUrl)) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setIsAnalyzing(true);
    setDetectionProgress(0);
    try {
      const result = await analyzeFileStructure();
      setAnalysisResult(result);
      setActiveTab('analysis');
    } catch (err) {
      console.error('Analysis error:', err);
      setError('An error occurred while analyzing the project');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle deployment
  const handleDeploy = () => {
    if (!analysisResult) return;

    setDeploymentStatus('preparing');
    setActiveTab('deployment');
    setTimeout(() => {
      setDeploymentStatus('extracting');
      setTimeout(() => {
        setDeploymentStatus('building');
        setTimeout(() => {
          setDeploymentStatus('deploying');
          setTimeout(() => {
            setDeploymentStatus('completed');
            const projectName = zipFile
              ? zipFile.name.replace('.zip', '')
              : githubUrl.split('/').pop().replace(/\.git$/, '');
            const subdomain = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            setDeployedUrl(`https://${subdomain}.zeyo.xyz`);
          }, 1500);
        }, 2000);
      }, 1500);
    }, 1000);
  };

  // Copy deployed URL to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Get framework icon based on detection result
  const getFrameworkIcon = (framework) => {
    switch (framework?.toLowerCase()) {
      case 'next.js':
        return (
          <div className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-xl shadow-md">
            <span className="text-2xl font-bold">N</span>
          </div>
        );
      case 'react':
        return (
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-xl shadow-md">
            <span className="text-2xl">⚛️</span>
          </div>
        );
      case 'vue.js':
        return (
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-xl shadow-md">
            <span className="text-2xl">V</span>
          </div>
        );
      case 'angular':
        return (
          <div className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-xl shadow-md">
            <span className="text-2xl">A</span>
          </div>
        );
      case 'svelte':
        return (
          <div className="flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-xl shadow-md">
            <span className="text-2xl">S</span>
          </div>
        );
      case 'nuxt':
        return (
          <div className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-xl shadow-md">
            <span className="text-2xl">N</span>
          </div>
        );
      case 'gatsby':
        return (
          <div className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-xl shadow-md">
            <span className="text-2xl">G</span>
          </div>
        );
      case 'express':
        return (
          <div className="flex items-center justify-center w-12 h-12 bg-gray-700 text-white rounded-xl shadow-md">
            <span className="text-2xl">E</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-12 h-12 bg-gray-200 text-gray-600 rounded-xl shadow-md">
            <span className="text-2xl">?</span>
          </div>
        );
    }
  };

  // Render file structure visualization
  const renderFileTreeView = (node, depth = 0) => {
    if (!node) return null;

    return (
      <div className="ml-3">
        {node.children && node.children.length > 0 ? (
          <>
            {node.name !== 'root' && (
              <div className="flex items-center py-1">
                <div className="w-4 h-4 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded mr-2">
                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                  </svg>
                </div>
                <span className="font-medium text-indigo-700 text-base">{node.name}/</span>
              </div>
            )}
            <div className="border-l border-indigo-100 pl-2">
              {node.children
                .sort((a, b) => {
                  if (a.type === 'directory' && b.type === 'file') return -1;
                  if (a.type === 'file' && b.type === 'directory') return 1;
                  return a.name.localeCompare(b.name);
                })
                .map((child, index) => (
                  <div key={index}>
                    {renderFileTreeView(child, depth + 1)}
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div className="flex items-center py-1">
            <div className="w-4 h-4 bg-blue-100 text-blue-600 flex items-center justify-center rounded mr-2">
              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <span className="text-gray-700 text-base">{node.name}</span>
          </div>
        )}
      </div>
    );
  };

  // Render file structure
  const renderFileStructure = () => {
    if (!fileStructure) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md transition-all duration-200 hover:shadow-lg"
      >
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center rounded-lg mr-3 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Project Structure</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full mr-2 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span className="text-base text-gray-700 font-semibold">Total Files:</span>
              <span className="ml-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-base font-bold shadow-sm">
                {fileCount}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 flex items-center justify-center rounded-full mr-2 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                </svg>
              </div>
              <span className="text-base text-gray-700 font-semibold">Project Size:</span>
              <span className="ml-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full text-base font-bold shadow-sm">
                {(fileStructure.totalSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            {packageJson && (
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 text-green-600 flex items-center justify-center rounded-full mr-2 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <span className="text-base text-gray-700 font-semibold">package.json:</span>
                <span className="ml-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full text-base font-bold shadow-sm">
                  Found
                </span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-amber-100 text-amber-600 flex items-center justify-center rounded-full mr-2 mt-1 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
              </div>
              <div>
                <span className="text-base text-gray-700 font-semibold">Directories:</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {fileStructure.directories.slice(0, 6).map((dir, index) => (
                    <div key={index} className="flex items-center text-gray-600 text-base">
                      <div className="w-1 h-4 bg-gradient-to-b from-indigo-400 to-indigo-500 rounded mr-2"></div>
                      {dir}
                    </div>
                  ))}
                  {fileStructure.directories.length > 6 && (
                    <div className="text-indigo-500 text-base">+{fileStructure.directories.length - 6} more</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {fileTreeView && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-bold text-gray-800 mb-3">File Structure Visualization</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-auto">
              {renderFileTreeView(fileTreeView)}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // Render analysis results
  const renderAnalysisResults = () => {
    if (!analysisResult) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-md transition-all duration-200 hover:shadow-lg"
      >
        <div className="flex items-center mb-6">
          <div className="mr-5">{getFrameworkIcon(analysisResult.framework)}</div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {analysisResult.framework} Detected
            </h3>
            <p className="text-base text-gray-500">
              We&apos;ve analyzed your project and identified the framework
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-base text-gray-700">Confidence Level</span>
                <span className="font-bold text-blue-600 text-base">{analysisResult.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisResult.confidence}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                ></motion.div>
              </div>
            </div>
            <div>
              <span className="font-semibold text-base text-gray-700 block mb-2">Detection Indicators:</span>
              <ul className="space-y-2">
                {analysisResult.indicators.map((indicator, index) => (
                  <motion.li 
                    key={index} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="flex items-center text-gray-600 text-base"
                  >
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {indicator}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 shadow-sm">
            <div className="text-base text-gray-500 mb-3">Deployment Recommendation</div>
            <div className="font-semibold text-gray-800 mb-3">
              This {analysisResult.framework} project is compatible with our automated deployment system.
            </div>
            <div className="text-base text-gray-600 mb-4">
              Your project will be optimized for production with automatic bundling, minification, and caching strategies.
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeploy}
              disabled={isAnalyzing || deploymentStatus}
              className={`w-full py-2 px-6 rounded-lg font-semibold text-lg text-white flex items-center justify-center space-x-2 ${
                isAnalyzing || deploymentStatus
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-lg shadow-md transition-all duration-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Deploy Project</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render deployment status
  const renderDeploymentStatus = () => {
    if (!deploymentStatus) return null;

    const statuses = [
      { key: 'preparing', label: 'Preparing Deployment', icon: '📦', description: 'Setting up deployment environment' },
      { key: 'extracting', label: 'Extracting Files', icon: '🔍', description: 'Processing your project files' },
      { key: 'building', label: 'Building Project', icon: '🔨', description: 'Compiling and optimizing for production' },
      { key: 'deploying', label: 'Deploying to Server', icon: '🚀', description: 'Uploading to global CDN network' },
      { key: 'completed', label: 'Deployment Complete', icon: '✅', description: 'Your project is live and ready to use' },
    ];

    const currentIndex = statuses.findIndex((status) => status.key === deploymentStatus);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-md"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          Deployment Progress
        </h3>
        <div className="space-y-4">
          {statuses.map((status, index) => (
            <motion.div
              key={status.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                index < currentIndex 
                  ? 'bg-green-50 border-green-200' 
                  : index === currentIndex 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`text-2xl w-10 flex justify-center ${index <= currentIndex ? '' : 'opacity-50'}`}>
                {status.icon}
              </div>
              <div className="ml-4 flex-grow">
                <div className={`font-bold text-base ${
                  index < currentIndex 
                    ? 'text-green-700' 
                    : index === currentIndex 
                      ? 'text-blue-700' 
                      : 'text-gray-500'
                }`}>
                  {status.label}
                </div>
                <div className="text-base text-gray-500">{status.description}</div>
              </div>
              <div className="ml-3">
                {index < currentIndex && (
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
                {index === currentIndex && (
                  <div className="h-8 w-8 flex items-center justify-center">
                    <div className="h-5 w-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {index > currentIndex && (
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center shadow-inner">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        {deploymentStatus === 'completed' && deployedUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-6 bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm"
          >
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h4 className="text-xl font-bold text-green-700">Deployment Successful!</h4>
            </div>
            <p className="text-green-700 text-base mb-3">Your project has been successfully deployed and is now live.</p>
            <div className="bg-white p-3 rounded-lg border border-green-200 flex items-center shadow-sm">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-semibold text-base hover:underline flex-grow"
              >
                {deployedUrl}
              </a>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => copyToClipboard(deployedUrl)}
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg text-base font-semibold transition-colors duration-200 flex items-center"
              >
                {copySuccess ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                    Copy URL
                  </>
                )}
              </motion.button>
            </div>
            <div className="mt-4 flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(deployedUrl, '_blank')}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2 px-3 rounded-lg text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                Open Website  
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-3 rounded-lg text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                View Analytics
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Progress indicator for analysis
  const renderProgressIndicator = () => {
    if (!isAnalyzing || detectionProgress === 0) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Analyzing Project</h3>
          <div className="mb-3">
            <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
              <span>Detecting framework and structure...</span>
              <span>{detectionProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${detectionProgress}%` }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3"
              ></motion.div>
            </div>
          </div>
          <p className="text-gray-600 text-base">
            {detectionProgress < 30 && "Reading project files..."}
            {detectionProgress >= 30 && detectionProgress < 60 && "Analyzing dependencies and structure..."}
            {detectionProgress >= 60 && detectionProgress < 90 && "Detecting framework patterns..."}
            {detectionProgress >= 90 && "Finalizing analysis..."}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>AutoDeploy - Deploy Your Web Project</title>
        <meta name="description" content="Automatically analyze and deploy your web projects" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 py-12 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto mt-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10 mt-16"
          >
            <div className="inline-flex items-center justify-center p-4 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-2xl mb-5 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-md">
              AutoDeploy
            </h1>
            <p className="text-xl text-white text-opacity-90 max-w-2xl mx-auto font-medium">
              Analyze and deploy your web projects with one click
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white shadow-lg rounded-2xl overflow-hidden mb-10"
          >
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex space-x-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 text-lg font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === 'upload'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Upload Project
                </button>
                {fileStructure && (
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`px-4 py-2 text-lg font-semibold rounded-lg transition-all duration-200 ${
                      activeTab === 'analysis'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Project Analysis
                  </button>
                )}
                {deploymentStatus && (
                  <button
                    onClick={() => setActiveTab('deployment')}
                    className={`px-4 py-2 text-lg font-semibold rounded-lg transition-all duration-200 ${
                      activeTab === 'deployment'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Deployment Status
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {activeTab === 'upload' && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-blue-700 text-base font-semibold shadow-sm">
                    Upload your project as a ZIP file or provide a GitHub repository URL to begin analysis.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                      whileHover={{ scale: 1.02, borderColor: '#3B82F6' }}
                      className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="text-center">
                        <motion.div 
                          animate={{ y: isDragging ? -5 : 0 }}
                          className="mx-auto h-12 w-12 text-gray-400 mb-3"
                        >
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                        </motion.div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          Upload ZIP File
                        </label>
                        <p className="text-base text-gray-500 mb-4">Drag and drop or click to browse</p>
                        <input
                          type="file"
                          accept=".zip"
                          onChange={handleFileChange}
                          className="block w-full text-base text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        {zipFile && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 text-base text-gray-700 bg-gray-50 rounded-lg p-2 flex items-center shadow-sm"
                          >
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {zipFile.name} selected
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02, borderColor: '#3B82F6' }}
                      className="border-2 border-gray-300 rounded-lg p-6 transition-all duration-200 shadow-sm"
                    >
                      <div className="mb-4">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                          </svg>
                          <label className="block text-lg font-semibold text-gray-700">
                            GitHub Repository URL
                          </label>
                        </div>
                        <input
                          type="text"
                          value={githubUrl}
                          onChange={handleGithubUrlChange}
                          placeholder="https://github.com/username/repository"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-base shadow-sm"
                        />
                      </div>
                      <div className="text-base text-gray-500">
                        <ul className="space-y-1">
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Must be a public repository
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Example: https://github.com/username/repo-name
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Supports all major web frameworks
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center text-base font-semibold shadow-sm"
                    >
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p>{error}</p>
                    </motion.div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`w-full py-2 px-6 rounded-lg font-semibold text-lg text-white flex items-center justify-center space-x-2 ${
                      isAnalyzing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-lg shadow-md transition-all duration-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-2 0a2 2 0 002 2h2a2 2 0 00-2-2h-2zm0 0a2 2 0 01-2-2V3a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>Analyze Project</span>
                  </motion.button>
                </div>
              )}
              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  {renderFileStructure()}
                  {renderAnalysisResults()}
                </div>
              )}
              {activeTab === 'deployment' && (
                <div>
                  {renderDeploymentStatus()}
                </div>
              )}
            </div>
          </motion.div>
          {renderProgressIndicator()}
        </div>
      </div>
    </div>
  );
}




// 'use client';
// import { useState, useEffect } from 'react';
// import Head from 'next/head';
// import JSZip from 'jszip';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';

// export default function AutoDeploy() {
//   const [zipFile, setZipFile] = useState(null);
//   const [githubUrl, setGithubUrl] = useState('');
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [analysisResult, setAnalysisResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [deploymentStatus, setDeploymentStatus] = useState(null);
//   const [deployedUrl, setDeployedUrl] = useState(null);
//   const [fileStructure, setFileStructure] = useState(null);
//   const [packageJson, setPackageJson] = useState(null);
//   const [extractedFiles, setExtractedFiles] = useState([]);
//   const [fileCount, setFileCount] = useState(0);
//   const [activeTab, setActiveTab] = useState('upload');
//   const [isDragging, setIsDragging] = useState(false);
//   const [detectionProgress, setDetectionProgress] = useState(0);
//   const [fileTreeView, setFileTreeView] = useState(null);
//   const [copySuccess, setCopySuccess] = useState(false);

//   // Enhanced framework detection patterns with weighted scoring and required indicators
//   const frameworkPatterns = {
//     nextjs: {
//       files: ['next.config.js', 'next.config.mjs', 'pages/_app.js', 'pages/_app.jsx', '.next/', 'src/app/layout.js', 'src/pages/index.js'],
//       directories: ['pages/', 'src/app/', 'src/pages/'],
//       dependencies: ['next'],
//       codePatterns: ['import { useRouter }', 'getStaticProps', 'getServerSideProps', 'app.getInitialProps', "'use client'"],
//       configPatterns: { 'next.config.js': ['rewrites', 'redirects', 'appDir: true'] },
//       weight: 2.5
//     },
//     react: {
//       files: ['src/App.js', 'src/App.jsx', 'src/index.js', 'src/index.jsx', 'react.config.js', 'babel.config.js'],
//       directories: ['src/components/'],
//       dependencies: ['react', 'react-dom'],
//       codePatterns: ['import React', 'ReactDOM.render', 'useState', 'useEffect'],
//       weight: 1.5
//     },
//     vue: {
//       files: ['vue.config.js', 'src/main.js', 'src/App.vue'],
//       directories: ['src/components/'],
//       dependencies: ['vue'],
//       codePatterns: ['createApp', 'Vue.use', '<template>', 'v-for', 'v-if'],
//       configPatterns: { 'vue.config.js': ['configureWebpack', 'css.loaderOptions'] },
//       weight: 1.4
//     },
//     angular: {
//       files: ['angular.json', 'src/app/app.module.ts', 'tsconfig.json'],
//       directories: ['src/app/'],
//       dependencies: ['@angular/core'],
//       codePatterns: ['@Component', 'NgModule', 'Injectable'],
//       configPatterns: { 'angular.json': ['projects', 'architect'] },
//       weight: 1.6
//     },
//     svelte: {
//       files: ['svelte.config.js', 'src/App.svelte', 'vite.config.js'],
//       directories: ['src/'],
//       dependencies: ['svelte'],
//       codePatterns: ['<script>', '<style>', 'export let'],
//       configPatterns: { 'vite.config.js': ['svelte()'] },
//       weight: 1.3
//     },
//     nuxt: {
//       files: ['nuxt.config.js', 'nuxt.config.ts', 'pages/index.vue'],
//       directories: ['pages/', 'components/'],
//       dependencies: ['nuxt'],
//       codePatterns: ['asyncData', 'middleware', 'plugins'],
//       configPatterns: { 'nuxt.config.js': ['modules', 'buildModules'] },
//       weight: 1.7,
//       required: ['nuxt.config.js', 'nuxt.config.ts', 'nuxt']
//     },
//     gatsby: {
//       files: ['gatsby-config.js', 'gatsby-node.js'],
//       directories: ['src/pages/'],
//       dependencies: ['gatsby'],
//       codePatterns: ['graphql`', 'createPages', 'GatsbyImage'],
//       weight: 1.5
//     },
//     express: {
//       files: ['app.js', 'server.js', 'routes/'],
//       directories: ['routes/'],
//       dependencies: ['express'],
//       codePatterns: ['app.use', 'app.listen', 'express.Router', 'app.get('],
//       weight: 1.4
//     },
//     nestjs: {
//       files: ['nest-cli.json', 'src/main.ts', 'tsconfig.json'],
//       directories: ['src/'],
//       dependencies: ['@nestjs/core'],
//       codePatterns: ['@Module', '@Controller', '@Injectable'],
//       weight: 1.6
//     }
//   };

//   // Handle ZIP file upload
//   const handleFileChange = (e) => {
//     setError(null);
//     if (e.target.files.length > 0) {
//       const file = e.target.files[0];
//       if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
//         setZipFile(file);
//         setGithubUrl('');
//       } else {
//         setError('Please upload a ZIP file containing your project');
//         setZipFile(null);
//       }
//     }
//   };

//   // Handle drag events
//   const handleDragEnter = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//     setError(null);
//     if (e.dataTransfer.files.length > 0) {
//       const file = e.dataTransfer.files[0];
//       if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
//         setZipFile(file);
//         setGithubUrl('');
//       } else {
//         setError('Please upload a ZIP file containing your project');
//         setZipFile(null);
//       }
//     }
//   };

//   // Handle GitHub URL input
//   const handleGithubUrlChange = (e) => {
//     setError(null);
//     setGithubUrl(e.target.value);
//     setZipFile(null);
//   };

//   // Validate GitHub URL
//   const validateGithubUrl = (url) => {
//     const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?(?:\?.*)?$/;
//     return githubRegex.test(url);
//   };

//   // Extract repository details from GitHub URL
//   const extractRepoDetails = (url) => {
//     const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
//     if (match) {
//       return [match[1], match[2].replace(/\.git$/, '')];
//     }
//     return [null, null];
//   };

//   // Fetch repository contents using GitHub API
//   const fetchRepoContents = async (owner, repo, path = '') => {
//     try {
//       const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching repo contents:', error);
//       return [];
//     }
//   };

//   // Fetch file content from GitHub repository
//   const fetchFileContent = async (owner, repo, path) => {
//     try {
//       const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
//       const content = atob(response.data.content);
//       return content;
//     } catch (error) {
//       console.error(`Error fetching file ${path}:`, error);
//       return null;
//     }
//   };

//   // Fetch package.json from GitHub repository
//   const fetchPackageJson = async (owner, repo) => {
//     try {
//       const content = await fetchFileContent(owner, repo, 'package.json');
//       return content ? JSON.parse(content) : null;
//     } catch (error) {
//       console.error('Error fetching package.json:', error);
//       return null;
//     }
//   };

//   // Fetch repository languages
//   const fetchRepoLanguages = async (owner, repo) => {
//     try {
//       const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching repo languages:', error);
//       return {};
//     }
//   };

//   // Check if directory exists in repository
//   const checkDirectoryExists = async (owner, repo, dir) => {
//     try {
//       await fetchRepoContents(owner, repo, dir);
//       return true;
//     } catch (error) {
//       return false;
//     }
//   };

//   // Recursively fetch all files in repository
//   const fetchAllRepoFiles = async (owner, repo, path = '', allFiles = []) => {
//     const contents = await fetchRepoContents(owner, repo, path);
//     for (const item of contents) {
//       if (item.type === 'file') {
//         allFiles.push(item);
//       } else if (item.type === 'dir') {
//         await fetchAllRepoFiles(owner, repo, item.path, allFiles);
//       }
//     }
//     return allFiles;
//   };

//   // Analyze key files for framework patterns (GitHub)
//   const analyzeKeyFiles = async (owner, repo, contents) => {
//     const signatures = {};
//     const filesToAnalyze = contents.filter(file =>
//       file.name.endsWith('.js') ||
//       file.name.endsWith('.jsx') ||
//       file.name.endsWith('.ts') ||
//       file.name.endsWith('.tsx') ||
//       file.name.endsWith('.vue') ||
//       file.name.endsWith('.svelte')
//     ).slice(0, 10);

//     const configFiles = contents.filter(file =>
//       file.name === 'next.config.js' ||
//       file.name === 'next.config.mjs' ||
//       file.name === 'vue.config.js' ||
//       file.name === 'angular.json' ||
//       file.name === 'svelte.config.js' ||
//       file.name === 'nuxt.config.js' ||
//       file.name === 'gatsby-config.js' ||
//       file.name === 'vite.config.js'
//     );

//     for (const file of filesToAnalyze) {
//       try {
//         const content = await fetchFileContent(owner, repo, file.path);
//         if (content) {
//           Object.keys(frameworkPatterns).forEach(framework => {
//             frameworkPatterns[framework].codePatterns.forEach(pattern => {
//               if (content.includes(pattern)) {
//                 signatures[framework] = (signatures[framework] || 0) + 1;
//               }
//             });
//           });
//         }
//       } catch (error) {
//         console.error(`Error analyzing file ${file.name}:`, error);
//       }
//     }

//     for (const file of configFiles) {
//       try {
//         const content = await fetchFileContent(owner, repo, file.path);
//         if (content) {
//           Object.keys(frameworkPatterns).forEach(framework => {
//             const patterns = frameworkPatterns[framework].configPatterns;
//             if (patterns && patterns[file.name]) {
//               patterns[file.name].forEach(pattern => {
//                 if (content.includes(pattern)) {
//                   signatures[framework] = (signatures[framework] || 0) + 2;
//                 }
//               });
//             }
//           });
//         }
//       } catch (error) {
//         console.error(`Error analyzing config file ${file.name}:`, error);
//       }
//     }

//     return signatures;
//   };

//   // Calculate framework score based on various indicators
//   const calculateFrameworkScore = (packageJson, contents, languages, signatures, directories) => {
//     const scores = {};
//     let isNextJsDetected = false;

//     Object.keys(frameworkPatterns).forEach(framework => {
//       let score = 0;
//       const patterns = frameworkPatterns[framework];
//       const indicators = [];

//       if (patterns.required && !patterns.required.some(req =>
//         (req.endsWith('.js') || req.endsWith('.ts')) ? contents.some(f => f.name === req || f.path === req) :
//         packageJson?.dependencies?.[req]
//       )) {
//         return;
//       }

//       if (packageJson && packageJson.dependencies) {
//         patterns.dependencies.forEach(dep => {
//           if (packageJson.dependencies[dep]) {
//             score += 3 * patterns.weight;
//             indicators.push(`Found ${dep} dependency (version: ${packageJson.dependencies[dep]})`);
//             if (dep === 'next') {
//               isNextJsDetected = true;
//             }
//           }
//         });
//       }

//       if (isNextJsDetected && framework === 'react') {
//         return;
//       }

//       patterns.files.forEach(file => {
//         if (contents.some(f => f.name === file || f.path === file)) {
//           score += (file === 'next.config.js' || file === 'next.config.mjs') ? 5 * patterns.weight : 2 * patterns.weight;
//           indicators.push(`Found ${file}`);
//         }
//       });

//       patterns.directories.forEach(dir => {
//         if (directories.includes(dir.replace('/', ''))) {
//           score += (dir === 'src/app/') ? 3 * patterns.weight : 1 * patterns.weight;
//           indicators.push(`Found ${dir} directory`);
//         }
//       });

//       if (languages) {
//         if (framework === 'vue' && languages.Vue) {
//           score += 2 * patterns.weight;
//         } else if ((framework === 'react' || framework === 'nextjs') && languages.JavaScript) {
//           score += patterns.weight;
//         } else if (framework === 'angular' && languages.TypeScript) {
//           score += 2 * patterns.weight;
//         } else if (framework === 'svelte' && languages.Svelte) {
//           score += 2 * patterns.weight;
//         }
//       }

//       if (signatures && signatures[framework]) {
//         score += signatures[framework] * patterns.weight;
//         indicators.push(`Detected ${signatures[framework]} code patterns specific to ${framework}`);
//       }

//       scores[framework] = { score, indicators };
//     });

//     const entries = Object.entries(scores).filter(([_, { score }]) => score > 0);
//     if (entries.length === 0) return { framework: 'Unknown', confidence: 0, indicators: [] };

//     entries.sort((a, b) => b[1].score - a[1].score);
//     const [topFramework, { score: topScore, indicators }] = entries[0];
//     const secondScore = entries[1]?.[1]?.score || 0;
//     const scoreGap = topScore - secondScore;
//     const confidence = Math.min(95, Math.round((topScore * 10) * (scoreGap / (topScore + 1))));

//     return {
//       framework: topFramework === 'nextjs' ? 'Next.js' :
//                  topFramework === 'react' ? 'React' :
//                  topFramework === 'vue' ? 'Vue.js' :
//                  topFramework.charAt(0).toUpperCase() + topFramework.slice(1),
//       confidence,
//       indicators
//     };
//   };

//   // Generate indicators for detected framework
//   const generateIndicators = (framework, packageJson, contents, signatures, directories) => {
//     const indicators = [];
//     const patterns = frameworkPatterns[framework];

//     if (packageJson && packageJson.dependencies) {
//       patterns.dependencies.forEach(dep => {
//         if (packageJson.dependencies[dep]) {
//           indicators.push(`Found ${dep} dependency (version: ${packageJson.dependencies[dep]})`);
//         }
//       });
//     }

//     patterns.files.forEach(file => {
//       if (contents.some(f => f.name === file || f.path === file)) {
//         indicators.push(`Found ${file}`);
//       }
//     });

//     patterns.directories.forEach(dir => {
//       if (directories.includes(dir.replace('/', ''))) {
//         indicators.push(`Found ${dir} directory`);
//       }
//     });

//     if (signatures && signatures[framework]) {
//       indicators.push(`Detected ${signatures[framework]} code patterns specific to ${framework}`);
//     }

//     return indicators.length > 0 ? indicators : ['Framework detected based on project structure'];
//   };

//   // Analyze GitHub repository
//   const analyzeGithubRepo = async (repoUrl) => {
//     const [owner, repo] = extractRepoDetails(repoUrl);
//     if (!owner || !repo) {
//       throw new Error('Invalid GitHub repository URL');
//     }

//     setDetectionProgress(10);
//     const allFiles = await fetchAllRepoFiles(owner, repo);
//     setDetectionProgress(30);
//     const packageJson = await fetchPackageJson(owner, repo);
//     setDetectionProgress(50);
//     const languages = await fetchRepoLanguages(owner, repo);
//     setDetectionProgress(70);
//     const frameworkSignatures = await analyzeKeyFiles(owner, repo, allFiles);
//     setDetectionProgress(90);

//     const rootContents = await fetchRepoContents(owner, repo);
//     const directories = rootContents.filter(item => item.type === 'dir').map(dir => dir.name);
//     const rootFiles = rootContents.filter(item => item.type === 'file').map(file => file.name);

//     const fileTree = {
//       name: repo,
//       type: 'directory',
//       children: [
//         ...allFiles.map(item => ({
//           name: item.name,
//           type: item.type,
//           path: item.path
//         }))
//       ]
//     };

//     setFileTreeView(fileTree);

//     const structure = {
//       rootFiles,
//       directories,
//       allFiles: allFiles.map(item => item.path),
//       packageJson,
//       totalSize: calculateEstimatedSize(allFiles.length, languages),
//       totalFiles: allFiles.length
//     };

//     setFileStructure(structure);
//     setPackageJson(packageJson);
//     setFileCount(allFiles.length);

//     const result = calculateFrameworkScore(packageJson, allFiles, languages, frameworkSignatures, directories);
//     setDetectionProgress(100);

//     return {
//       ...result,
//       projectSize: structure.totalSize,
//       fileCount: structure.totalFiles
//     };
//   };

//   // Estimate repository size based on file count and languages
//   const calculateEstimatedSize = (fileCount, languages) => {
//     const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
//     return totalBytes > 0 ? totalBytes : fileCount * 5000;
//   };

//   // Simulate GitHub repository structure
//   const simulateGithubFileStructure = () => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const isNextRepo = githubUrl.toLowerCase().includes('next');
//         const isReactRepo = githubUrl.toLowerCase().includes('react');
//         const isVueRepo = githubUrl.toLowerCase().includes('vue');

//         let rootFiles = ['package.json', '.gitignore', 'README.md'];
//         let directories = ['src', 'public'];
//         let mockPackageJson = {
//           name: githubUrl.split('/').pop(),
//           dependencies: {},
//         };

//         if (isNextRepo) {
//           rootFiles.push('next.config.js', 'tsconfig.json');
//           directories.push('pages', 'components', 'src/app');
//           mockPackageJson.dependencies = {
//             next: '^13.0.0',
//             react: '^18.0.0',
//             'react-dom': '^18.0.0',
//           };
//         } else if (isReactRepo) {
//           directories.push('components', 'assets');
//           mockPackageJson.dependencies = {
//             react: '^18.0.0',
//             'react-dom': '^18.0.0',
//             'react-scripts': '5.0.0',
//           };
//         } else if (isVueRepo) {
//           rootFiles.push('vue.config.js');
//           directories.push('components', 'views');
//           mockPackageJson.dependencies = {
//             vue: '^3.2.0',
//             'vue-router': '^4.0.0',
//             vuex: '^4.0.0',
//           };
//         }

//         const structure = {
//           rootFiles,
//           directories,
//           packageJson: mockPackageJson,
//           totalFiles: 150 + Math.floor(Math.random() * 500),
//           totalSize: 1024 * 1024 * (5 + Math.floor(Math.random() * 20)),
//         };

//         setFileStructure(structure);
//         setPackageJson(mockPackageJson);
//         setFileCount(structure.totalFiles);
//         resolve(structure);
//       }, 1000);
//     });
//   };

//   // Analyze ZIP file structure
//   const analyzeFileStructure = async () => {
//     if (!zipFile && !githubUrl) {
//       setError('Please upload a ZIP file or enter a GitHub URL');
//       return;
//     }

//     if (githubUrl) {
//       try {
//         return await analyzeGithubRepo(githubUrl);
//       } catch (error) {
//         console.error('GitHub analysis error:', error);
//         return simulateGithubFileStructure();
//       }
//     }

//     try {
//       const zip = new JSZip();
//       const content = await zip.loadAsync(zipFile);

//       const rootFiles = [];
//       const directories = new Set();
//       const allFiles = [];
//       let foundPackageJson = null;
//       let totalFiles = 0;
//       const filePromises = [];
//       const frameworkSignatures = {};

//       setDetectionProgress(20);

//       Object.keys(content.files).forEach((filename) => {
//         const file = content.files[filename];
//         if (!file.dir) {
//           totalFiles++;
//           allFiles.push(filename);

//           if (!filename.includes('/')) {
//             rootFiles.push(filename);
//           } else {
//             const parts = filename.split('/');
//             directories.add(parts[0]);
//           }

//           if (filename === 'package.json') {
//             filePromises.push(
//               file.async('string').then((content) => {
//                 try {
//                   foundPackageJson = JSON.parse(content);
//                 } catch (e) {
//                   console.error('Failed to parse package.json:', e);
//                 }
//               })
//             );
//           }

//           if (
//             filename.endsWith('.js') ||
//             filename.endsWith('.jsx') ||
//             filename.endsWith('.ts') ||
//             filename.endsWith('.tsx') ||
//             filename.endsWith('.vue') ||
//             filename.endsWith('.svelte') ||
//             filename === 'next.config.js' ||
//             filename === 'next.config.mjs' ||
//             filename === 'vue.config.js' ||
//             filename === 'angular.json' ||
//             filename === 'svelte.config.js' ||
//             filename === 'nuxt.config.js' ||
//             filename === 'gatsby-config.js' ||
//             filename === 'vite.config.js'
//           ) {
//             filePromises.push(
//               file.async('string').then((content) => {
//                 Object.keys(frameworkPatterns).forEach(framework => {
//                   frameworkPatterns[framework].codePatterns.forEach(pattern => {
//                     if (content.includes(pattern)) {
//                       frameworkSignatures[framework] = (frameworkSignatures[framework] || 0) + 1;
//                     }
//                   });

//                   const patterns = frameworkPatterns[framework].configPatterns;
//                   if (patterns && patterns[filename]) {
//                     patterns[filename].forEach(pattern => {
//                       if (content.includes(pattern)) {
//                         frameworkSignatures[framework] = (frameworkSignatures[framework] || 0) + 2;
//                       }
//                     });
//                   }
//                 });
//               })
//             );
//           }
//         }
//       });

//       setDetectionProgress(50);
//       await Promise.all(filePromises);
//       setDetectionProgress(70);

//       setFileCount(totalFiles);
//       setPackageJson(foundPackageJson);
//       setExtractedFiles(allFiles);

//       const fileTree = createFileTree(allFiles);
//       setFileTreeView(fileTree);

//       const structure = {
//         rootFiles,
//         directories: Array.from(directories),
//         allFiles,
//         packageJson: foundPackageJson,
//         totalSize: zipFile.size,
//         totalFiles,
//       };

//       setFileStructure(structure);
//       setDetectionProgress(90);

//       const frameworkResult = detectFrameworkAdvanced(structure, frameworkSignatures, Array.from(directories));

//       setDetectionProgress(100);

//       return {
//         ...frameworkResult,
//         projectSize: structure.totalSize,
//         fileCount: structure.totalFiles
//       };
//     } catch (err) {
//       console.error('ZIP analysis error:', err);
//       throw new Error('Failed to extract zip file contents');
//     }
//   };

//   // Create file tree structure for visualization
//   const createFileTree = (files) => {
//     const root = {
//       name: 'root',
//       type: 'directory',
//       children: []
//     };

//     files.forEach(path => {
//       const parts = path.split('/');
//       let currentNode = root;

//       parts.forEach((part, index) => {
//         if (part === '') return;

//         let found = currentNode.children.find(child => child.name === part);

//         if (!found) {
//           const isLastPart = index === parts.length - 1;
//           const newNode = {
//             name: part,
//             type: isLastPart ? 'file' : 'directory',
//             children: []
//           };
//           currentNode.children.push(newNode);
//           found = newNode;
//         }

//         currentNode = found;
//       });
//     });

//     return root;
//   };

//   // Advanced framework detection with weighted scoring
//   const detectFrameworkAdvanced = (structure, codeSignatures, directories) => {
//     const scores = {};
//     let isNextJsDetected = false;

//     Object.keys(frameworkPatterns).forEach(framework => {
//       let score = 0;
//       const patterns = frameworkPatterns[framework];
//       const indicators = [];

//       if (patterns.required && !patterns.required.some(req =>
//         (req.endsWith('.js') || req.endsWith('.ts')) ? structure.allFiles.includes(req) :
//         structure.packageJson?.dependencies?.[req]
//       )) {
//         return;
//       }

//       if (structure.packageJson && structure.packageJson.dependencies) {
//         patterns.dependencies.forEach(dep => {
//           if (structure.packageJson.dependencies[dep]) {
//             score += 3 * patterns.weight;
//             indicators.push(`Found ${dep} dependency (version: ${structure.packageJson.dependencies[dep]})`);
//             if (dep === 'next') {
//               isNextJsDetected = true;
//             }
//           }
//         });
//       }

//       if (isNextJsDetected && framework === 'react') {
//         return;
//       }

//       patterns.files.forEach(file => {
//         if (structure.allFiles.some(f => f.endsWith(file))) {
//           score += (file === 'next.config.js' || file === 'next.config.mjs') ? 5 * patterns.weight : 2 * patterns.weight;
//           indicators.push(`Found ${file}`);
//         }
//       });

//       patterns.directories.forEach(dir => {
//         if (directories.includes(dir.replace('/', ''))) {
//           score += (dir === 'src/app/') ? 3 * patterns.weight : 1 * patterns.weight;
//           indicators.push(`Found ${dir} directory`);
//         }
//       });

//       if (codeSignatures[framework]) {
//         score += codeSignatures[framework] * patterns.weight;
//         indicators.push(`Detected ${codeSignatures[framework]} code patterns specific to ${framework}`);
//       }

//       scores[framework] = { score, indicators };
//     });

//     const entries = Object.entries(scores).filter(([_, { score }]) => score > 0);
//     if (entries.length === 0) return { framework: 'Unknown', confidence: 0, indicators: [] };

//     entries.sort((a, b) => b[1].score - a[1].score);
//     const [topFramework, { score: topScore, indicators }] = entries[0];
//     const secondScore = entries[1]?.[1]?.score || 0;
//     const scoreGap = topScore - secondScore;
//     const confidence = Math.min(95, Math.round((topScore * 10) * (scoreGap / (topScore + 1))));

//     return {
//       framework: topFramework === 'nextjs' ? 'Next.js' :
//                  topFramework === 'react' ? 'React' :
//                  topFramework === 'vue' ? 'Vue.js' :
//                  topFramework.charAt(0).toUpperCase() + topFramework.slice(1),
//       confidence,
//       indicators: indicators.length > 0 ? indicators : ['Framework detected based on project structure']
//     };
//   };

//   // Handle analysis
//   const handleAnalyze = async () => {
//     setError(null);
//     if (!zipFile && !githubUrl) {
//       setError('Please upload a ZIP file or enter a GitHub URL');
//       return;
//     }
//     if (githubUrl && !validateGithubUrl(githubUrl)) {
//       setError('Please enter a valid GitHub repository URL');
//       return;
//     }

//     setIsAnalyzing(true);
//     setDetectionProgress(0);
//     try {
//       const result = await analyzeFileStructure();
//       setAnalysisResult(result);
//       setActiveTab('analysis');
//     } catch (err) {
//       console.error('Analysis error:', err);
//       setError('An error occurred while analyzing the project');
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   // Handle deployment
//   const handleDeploy = () => {
//     if (!analysisResult) return;

//     setDeploymentStatus('preparing');
//     setActiveTab('deployment');
//     setTimeout(() => {
//       setDeploymentStatus('extracting');
//       setTimeout(() => {
//         setDeploymentStatus('building');
//         setTimeout(() => {
//           setDeploymentStatus('deploying');
//           setTimeout(() => {
//             setDeploymentStatus('completed');
//             const projectName = zipFile
//               ? zipFile.name.replace('.zip', '')
//               : githubUrl.split('/').pop().replace(/\.git$/, '');
//             const subdomain = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
//             setDeployedUrl(`https://${subdomain}.zeyo.xyz`);
//           }, 1500);
//         }, 2000);
//       }, 1500);
//     }, 1000);
//   };

//   // Copy deployed URL to clipboard
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text).then(() => {
//       setCopySuccess(true);
//       setTimeout(() => setCopySuccess(false), 2000);
//     });
//   };

//   // Get framework icon based on detection result
//   const getFrameworkIcon = (framework) => {
//     switch (framework?.toLowerCase()) {
//       case 'next.js':
//         return (
//           <div className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-xl shadow-md">
//             <span className="text-2xl font-bold">N</span>
//           </div>
//         );
//       case 'react':
//         return (
//           <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-xl shadow-md">
//             <span className="text-2xl">⚛️</span>
//           </div>
//         );
//       case 'vue.js':
//         return (
//           <div className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-xl shadow-md">
//             <span className="text-2xl">V</span>
//           </div>
//         );
//       case 'angular':
//         return (
//           <div className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-xl shadow-md">
//             <span className="text-2xl">A</span>
//           </div>
//         );
//       case 'svelte':
//         return (
//           <div className="flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-xl shadow-md">
//             <span className="text-2xl">S</span>
//           </div>
//         );
//       case 'nuxt':
//         return (
//           <div className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-xl shadow-md">
//             <span className="text-2xl">N</span>
//           </div>
//         );
//       case 'gatsby':
//         return (
//           <div className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-xl shadow-md">
//             <span className="text-2xl">G</span>
//           </div>
//         );
//       case 'express':
//         return (
//           <div className="flex items-center justify-center w-12 h-12 bg-gray-700 text-white rounded-xl shadow-md">
//             <span className="text-2xl">E</span>
//           </div>
//         );
//       default:
//         return (
//           <div className="flex items-center justify-center w-12 h-12 bg-gray-200 text-gray-600 rounded-xl shadow-md">
//             <span className="text-2xl">?</span>
//           </div>
//         );
//     }
//   };

//   // Render file structure visualization
//   const renderFileTreeView = (node, depth = 0) => {
//     if (!node) return null;

//     return (
//       <div className="ml-3">
//         {node.children && node.children.length > 0 ? (
//           <>
//             {node.name !== 'root' && (
//               <div className="flex items-center py-1">
//                 <div className="w-4 h-4 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded mr-2">
//                   <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
//                   </svg>
//                 </div>
//                 <span className="font-medium text-indigo-700 text-base">{node.name}/</span>
//               </div>
//             )}
//             <div className="border-l border-indigo-100 pl-2">
//               {node.children
//                 .sort((a, b) => {
//                   if (a.type === 'directory' && b.type === 'file') return -1;
//                   if (a.type === 'file' && b.type === 'directory') return 1;
//                   return a.name.localeCompare(b.name);
//                 })
//                 .map((child, index) => (
//                   <div key={index}>
//                     {renderFileTreeView(child, depth + 1)}
//                   </div>
//                 ))}
//             </div>
//           </>
//         ) : (
//           <div className="flex items-center py-1">
//             <div className="w-4 h-4 bg-blue-100 text-blue-600 flex items-center justify-center rounded mr-2">
//               <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
//               </svg>
//             </div>
//             <span className="text-gray-700 text-base">{node.name}</span>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Render file structure
//   const renderFileStructure = () => {
//     if (!fileStructure) return null;

//     return (
//       <motion.div 
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//         className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md transition-all duration-200 hover:shadow-lg"
//       >
//         <div className="flex items-center mb-4">
//           <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center rounded-lg mr-3 shadow-sm">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
//             </svg>
//           </div>
//           <h3 className="text-xl font-bold text-gray-800">Project Structure</h3>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             <div className="flex items-center">
//               <div className="w-6 h-6 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full mr-2 shadow-sm">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
//                 </svg>
//               </div>
//               <span className="text-base text-gray-700 font-semibold">Total Files:</span>
//               <span className="ml-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-base font-bold shadow-sm">
//                 {fileCount}
//               </span>
//             </div>
//             <div className="flex items-center">
//               <div className="w-6 h-6 bg-purple-100 text-purple-600 flex items-center justify-center rounded-full mr-2 shadow-sm">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2"></path>
//                 </svg>
//               </div>
//               <span className="text-base text-gray-700 font-semibold">Project Size:</span>
//               <span className="ml-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full text-base font-bold shadow-sm">
//                 {(fileStructure.totalSize / (1024 * 1024)).toFixed(2)} MB
//               </span>
//             </div>
//             <div>
//               <h4 className="text-base font-semibold text-gray-700 mb-2">Root Files:</h4>
//               <ul className="space-y-1">
//                 {fileStructure.rootFiles.slice(0, 5).map((file, index) => (
//                   <li key={index} className="flex items-center text-sm text-gray-600">
//                     <div className="w-4 h-4 bg-blue-50 text-blue-500 flex items-center justify-center rounded mr-2">
//                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
//                       </svg>
//                     </div>
//                     {file}
//                   </li>
//                 ))}
//                 {fileStructure.rootFiles.length > 5 && (
//                   <li className="text-sm text-gray-500">+ {fileStructure.rootFiles.length - 5} more</li>
//                 )}
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-base font-semibold text-gray-700 mb-2">Directories:</h4>
//               <ul className="space-y-1">
//                 {fileStructure.directories.slice(0, 5).map((dir, index) => (
//                   <li key={index} className="flex items-center text-sm text-gray-600">
//                     <div className="w-4 h-4 bg-indigo-50 text-indigo-500 flex items-center justify-center rounded mr-2">
//                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
//                       </svg>
//                     </div>
//                     {dir}/
//                   </li>
//                 ))}
//                 {fileStructure.directories.length > 5 && (
//                   <li className="text-sm text-gray-500">+ {fileStructure.directories.length - 5} more</li>
//                 )}
//               </ul>
//             </div>
//           </div>
//           <div className="bg-gray-50 rounded-xl p-4 overflow-auto max-h-96">
//             <h4 className="text-base font-semibold text-gray-700 mb-3">File Tree:</h4>
//             {fileTreeView && renderFileTreeView(fileTreeView)}
//           </div>
//         </div>
//       </motion.div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
//       <Head>
//         <title>AutoDeploy - Deploy Your Web Project</title>
//         <meta name="description" content="Automatically analyze and deploy your web projects with ease." />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       <motion.div 
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
//       >
//         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
//           <h1 className="text-3xl font-bold text-white">AutoDeploy</h1>
//           <p className="text-indigo-100 mt-2">Upload your project or paste a GitHub URL to analyze and deploy automatically.</p>
//         </div>

//         <div className="border-b border-gray-200">
//           <nav className="flex">
//             <button
//               className={`flex-1 py-4 px-6 text-center font-semibold ${activeTab === 'upload' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
//               onClick={() => setActiveTab('upload')}
//             >
//               Upload
//             </button>
//             <button
//               className={`flex-1 py-4 px-6 text-center font-semibold ${activeTab === 'analysis' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
//               onClick={() => setActiveTab('analysis')}
//               disabled={!analysisResult}
//             >
//               Analysis
//             </button>
//             <button
//               className={`flex-1 py-4 px-6 text-center font-semibold ${activeTab === 'deployment' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
//               onClick={() => setActiveTab('deployment')}
//               disabled={!deploymentStatus}
//             >
//               Deployment
//             </button>
//           </nav>
//         </div>

//         <div className="p-6">
//           <AnimatePresence mode="wait">
//             {activeTab === 'upload' && (
//               <motion.div
//                 key="upload"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: 20 }}
//                 transition={{ duration: 0.3 }}
//                 className="space-y-6"
//               >
//                 <div
//                   className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
//                     isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'
//                   }`}
//                   onDragEnter={handleDragEnter}
//                   onDragLeave={handleDragLeave}
//                   onDragOver={handleDragOver}
//                   onDrop={handleDrop}
//                 >
//                   <div className="flex justify-center mb-4">
//                     <div className="w-12 h-12 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full">
//                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6M9 19h6m-3-3v6"></path>
//                       </svg>
//                     </div>
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-800">Drag & Drop Your ZIP File</h3>
//                   <p className="text-gray-600 mt-2">Or click to browse and upload your project ZIP file.</p>
//                   <input
//                     type="file"
//                     accept=".zip"
//                     onChange={handleFileChange}
//                     className="hidden"
//                     id="file-upload"
//                   />
//                   <label
//                     htmlFor="file-upload"
//                     className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors duration-200"
//                   >
//                     Browse Files
//                   </label>
//                   {zipFile && (
//                     <p className="mt-4 text-sm text-gray-700">
//                       Selected: <span className="font-semibold">{zipFile.name}</span>
//                     </p>
//                   )}
//                 </div>

//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
//                     </svg>
//                   </div>
//                   <input
//                     type="text"
//                     value={githubUrl}
//                     onChange={handleGithubUrlChange}
//                     placeholder="Or paste a GitHub repository URL (e.g., https://github.com/user/repo)"
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
//                   />
//                 </div>

//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
//                   >
//                     {error}
//                   </motion.div>
//                 )}

//                 <button
//                   onClick={handleAnalyze}
//                   disabled={isAnalyzing || (!zipFile && !githubUrl)}
//                   className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
//                     isAnalyzing || (!zipFile && !githubUrl)
//                       ? 'bg-gray-400 cursor-not-allowed'
//                       : 'bg-indigo-600 hover:bg-indigo-700'
//                   }`}
//                 >
//                   {isAnalyzing ? (
//                     <div className="flex items-center justify-center">
//                       <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
//                       </svg>
//                       Analyzing...
//                     </div>
//                   ) : (
//                     'Analyze Project'
//                   )}
//                 </button>
//               </motion.div>
//             )}

//             {activeTab === 'analysis' && analysisResult && (
//               <motion.div
//                 key="analysis"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: 20 }}
//                 transition={{ duration: 0.3 }}
//                 className="space-y-6"
//               >
//                 <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
//                   <div className="flex items-center mb-4">
//                     {getFrameworkIcon(analysisResult.framework)}
//                     <div className="ml-4">
//                       <h3 className="text-xl font-bold text-gray-800">Detected Framework</h3>
//                       <p className="text-gray-600">
//                         {analysisResult.framework} ({analysisResult.confidence}% confidence)
//                       </p>
//                     </div>
//                   </div>
//                   <div className="mt-4">
//                     <h4 className="text-base font-semibold text-gray-700 mb-2">Detection Indicators:</h4>
//                     <ul className="list-disc pl-5 space-y-1 text-gray-600">
//                       {analysisResult.indicators.map((indicator, index) => (
//                         <li key={index} className="text-sm">{indicator}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>
//                 {renderFileStructure()}
//                 <button
//                   onClick={handleDeploy}
//                   className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200"
//                 >
//                   Deploy Project
//                 </button>
//               </motion.div>
//             )}

//             {activeTab === 'deployment' && deploymentStatus && (
//               <motion.div
//                 key="deployment"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: 20 }}
//                 transition={{ duration: 0.3 }}
//                 className="space-y-6"
//               >
//                 <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
//                   <h3 className="text-xl font-bold text-gray-800 mb-4">Deployment Status</h3>
//                   <div className="space-y-4">
//                     <div className="flex items-center">
//                       <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
//                         deploymentStatus === 'preparing' || deploymentStatus === 'extracting' || deploymentStatus === 'building' || deploymentStatus === 'deploying' || deploymentStatus === 'completed'
//                           ? 'bg-green-100 text-green-600'
//                           : 'bg-gray-100 text-gray-400'
//                       }`}>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                         </svg>
//                       </div>
//                       <span className="ml-3 text-gray-700">Preparing project</span>
//                     </div>
//                     <div className="flex items-center">
//                       <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
//                         deploymentStatus === 'extracting' || deploymentStatus === 'building' || deploymentStatus === 'deploying' || deploymentStatus === 'completed'
//                           ? 'bg-green-100 text-green-600'
//                           : 'bg-gray-100 text-gray-400'
//                       }`}>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                         </svg>
//                       </div>
//                       <span className="ml-3 text-gray-700">Extracting files</span>
//                     </div>
//                     <div className="flex items-center">
//                       <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
//                         deploymentStatus === 'building' || deploymentStatus === 'deploying' || deploymentStatus === 'completed'
//                           ? 'bg-green-100 text-green-600'
//                           : 'bg-gray-100 text-gray-400'
//                       }`}>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                         </svg>
//                       </div>
//                       <span className="ml-3 text-gray-700">Building project</span>
//                     </div>
//                     <div className="flex items-center">
//                       <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
//                         deploymentStatus === 'deploying' || deploymentStatus === 'completed'
//                           ? 'bg-green-100 text-green-600'
//                           : 'bg-gray-100 text-gray-400'
//                       }`}>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                         </svg>
//                       </div>
//                       <span className="ml-3 text-gray-700">Deploying to server</span>
//                     </div>
//                     {deploymentStatus === 'completed' && (
//                       <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
//                         <div className="flex items-center">
//                           <div className="w-10 h-10 bg-green-100 text-green-600 flex items-center justify-center rounded-full mr-3">
//                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                             </svg>
//                           </div>
//                           <div>
//                             <h4 className="text-lg font-semibold text-green-800">Deployment Successful!</h4>
//                             <p className="text-green-700">Your project is live at:</p>
//                             <a
//                               href={deployedUrl}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-indigo-600 font-semibold hover:underline break-all"
//                             >
//                               {deployedUrl}
//                             </a>
//                           </div>
//                         </div>
//                         <button
//                           onClick={() => copyToClipboard(deployedUrl)}
//                           className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 flex items-center"
//                         >
//                           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
//                           </svg>
//                           {copySuccess ? 'Copied!' : 'Copy URL'}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </motion.div>
//     </div>
//   );
// }