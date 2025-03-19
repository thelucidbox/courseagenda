import os from 'os';
import fs from 'fs';
import path from 'path';
import { LogLevel } from './log-types';

// Store error statistics in memory
const errorStats = {
  // Counts since server start
  totalErrors: 0,
  errorsByLevel: {
    [LogLevel.INFO]: 0,
    [LogLevel.WARN]: 0,
    [LogLevel.ERROR]: 0,
    [LogLevel.FATAL]: 0
  },
  errorsByCode: {} as Record<string, number>,
  
  // Last error time and details
  lastError: {
    timestamp: null as string | null,
    level: null as LogLevel | null,
    message: null as string | null,
    code: null as string | null
  },
  
  // Recent errors list (circular buffer)
  recentErrors: [] as Array<{
    timestamp: string;
    level: LogLevel;
    message: string;
    code?: string;
  }>,
  
  // Maximum number of recent errors to store
  maxRecentErrors: 10
};

// Record an error occurrence
export function recordError(level: LogLevel, message: string, code?: string): void {
  // Update counts
  errorStats.totalErrors++;
  errorStats.errorsByLevel[level]++;
  
  if (code) {
    errorStats.errorsByCode[code] = (errorStats.errorsByCode[code] || 0) + 1;
  }
  
  // Update last error details
  const timestamp = new Date().toISOString();
  errorStats.lastError = {
    timestamp,
    level,
    message,
    code: code || null
  };
  
  // Add to recent errors list
  errorStats.recentErrors.unshift({
    timestamp,
    level,
    message,
    code
  });
  
  // Keep recent errors list at max size
  if (errorStats.recentErrors.length > errorStats.maxRecentErrors) {
    errorStats.recentErrors.pop();
  }
}

// Check if logs directory exists and is writable
function checkLogsDirectory(): { 
  exists: boolean; 
  writable: boolean; 
  size?: number; 
  error?: string; 
} {
  try {
    const logDir = process.env.LOG_DIR || 'logs';
    const logDirPath = path.resolve(logDir);
    
    if (!fs.existsSync(logDirPath)) {
      return { exists: false, writable: false };
    }
    
    // Check if directory is writable
    try {
      const testFile = path.join(logDirPath, '.write-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      
      // Get directory size
      let size = 0;
      const files = fs.readdirSync(logDirPath);
      
      for (const file of files) {
        const filePath = path.join(logDirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          size += stats.size;
        }
      }
      
      return { 
        exists: true, 
        writable: true,
        size 
      };
    } catch (err) {
      return { 
        exists: true, 
        writable: false,
        error: err instanceof Error ? err.message : String(err)
      };
    }
  } catch (err) {
    return { 
      exists: false, 
      writable: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

// Get database status
async function getDatabaseStatus(storage: any): Promise<{
  connected: boolean;
  error?: string;
  poolStats?: any;
}> {
  try {
    // Try a simple query to check database connection
    await storage.getAllUsers();
    
    return {
      connected: true,
      // Return pool stats if available
      poolStats: storage.getPoolStats?.() || undefined
    };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

// Get process memory usage
function getMemoryUsage(): {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  systemTotal: number;
  systemFree: number;
  systemUsagePercent: number;
} {
  const memUsage = process.memoryUsage();
  const systemTotal = os.totalmem();
  const systemFree = os.freemem();
  
  return {
    rss: memUsage.rss, // Resident Set Size - total memory allocated
    heapTotal: memUsage.heapTotal, // V8 heap total
    heapUsed: memUsage.heapUsed, // V8 heap used
    external: memUsage.external, // Memory used by C++ objects bound to JS
    systemTotal,
    systemFree,
    systemUsagePercent: Math.round((1 - (systemFree / systemTotal)) * 100)
  };
}

// Get CPU usage
function getCpuInfo(): {
  cores: number;
  model: string;
  load1m: number;
  load5m: number;
  load15m: number;
} {
  const cpus = os.cpus();
  const loadAvg = os.loadavg();
  
  return {
    cores: cpus.length,
    model: cpus[0].model,
    load1m: loadAvg[0],
    load5m: loadAvg[1],
    load15m: loadAvg[2]
  };
}

// Get uptime information
function getUptimeInfo(): {
  serverUptime: number;
  systemUptime: number;
} {
  return {
    serverUptime: process.uptime(),
    systemUptime: os.uptime()
  };
}

// Generate complete health check data
export async function generateHealthCheck(storage: any): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: ReturnType<typeof getUptimeInfo>;
  memory: ReturnType<typeof getMemoryUsage>;
  cpu: ReturnType<typeof getCpuInfo>;
  storage: {
    database: Awaited<ReturnType<typeof getDatabaseStatus>>;
    logs: ReturnType<typeof checkLogsDirectory>;
  };
  errors: typeof errorStats;
}> {
  // Get all health metrics
  const databaseStatus = await getDatabaseStatus(storage);
  const logsStatus = checkLogsDirectory();
  
  // Determine overall health status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (!databaseStatus.connected || !logsStatus.writable) {
    status = 'unhealthy';
  } else if (errorStats.errorsByLevel[LogLevel.FATAL] > 0) {
    status = 'unhealthy';
  } else if (errorStats.errorsByLevel[LogLevel.ERROR] > 0) {
    status = 'degraded';
  }
  
  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: getUptimeInfo(),
    memory: getMemoryUsage(),
    cpu: getCpuInfo(),
    storage: {
      database: databaseStatus,
      logs: logsStatus
    },
    errors: errorStats
  };
}

// Export error stats for use in other modules
export { errorStats };