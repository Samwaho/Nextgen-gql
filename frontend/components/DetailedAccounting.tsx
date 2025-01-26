import React from "react";
import { useQuery } from "@apollo/client";
import { GET_CUSTOMER_ACCOUNTING, AccountingData } from "@/graphql/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Download,
  Upload,
  Network,
  Layers,
  Clock,
  Activity,
} from "lucide-react";

interface DetailedAccountingProps {
  username: string;
}

export function DetailedAccounting({ username }: DetailedAccountingProps) {
  const { data, loading } = useQuery<{ customerAccounting: AccountingData }>(
    GET_CUSTOMER_ACCOUNTING,
    {
      variables: { username },
      pollInterval: 10000, // Poll every 10 seconds for updates
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!data?.customerAccounting) {
    return null;
  }

  const accounting = data.customerAccounting;

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0s";
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
    return parts.join(" ");
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Activity className="h-4 w-4" />
          </div>
          Detailed Accounting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div className="space-y-6">
          {/* Session Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-medium">Session Information</h3>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-gray-500">Status</TableCell>
                    <TableCell>{accounting.status}</TableCell>
                    <TableCell className="font-medium text-gray-500">Session ID</TableCell>
                    <TableCell className="font-mono text-sm">{accounting.sessionId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-gray-500">Session Time</TableCell>
                    <TableCell>{formatDuration(accounting.sessionTime)}</TableCell>
                    <TableCell className="font-medium text-gray-500">Session Hours</TableCell>
                    <TableCell>{accounting.sessionTimeHours.toFixed(2)} hours</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-gray-500">Idle Timeout</TableCell>
                    <TableCell>{formatDuration(accounting.idleTimeout)}</TableCell>
                    <TableCell className="font-medium text-gray-500">Session Timeout</TableCell>
                    <TableCell>{formatDuration(accounting.sessionTimeout)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Data Usage */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-medium">Data Usage</h3>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead>Direction</TableHead>
                    <TableHead>Bytes</TableHead>
                    <TableHead>Packets</TableHead>
                    <TableHead>Gigawords</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-green-100 dark:bg-green-900/30">
                          <Download className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        Download
                      </div>
                    </TableCell>
                    <TableCell>{formatBytes(accounting.inputOctets)}</TableCell>
                    <TableCell>{accounting.inputPackets.toLocaleString()}</TableCell>
                    <TableCell>{accounting.inputGigawords}</TableCell>
                    <TableCell className="font-medium text-green-600 dark:text-green-400">
                      {formatBytes(accounting.totalInputBytes)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                          <Upload className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        Upload
                      </div>
                    </TableCell>
                    <TableCell>{formatBytes(accounting.outputOctets)}</TableCell>
                    <TableCell>{accounting.outputPackets.toLocaleString()}</TableCell>
                    <TableCell>{accounting.outputGigawords}</TableCell>
                    <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                      {formatBytes(accounting.totalOutputBytes)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/30">
                          <Layers className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        Total
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatBytes(accounting.inputOctets + accounting.outputOctets)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {(accounting.inputPackets + accounting.outputPackets).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {accounting.inputGigawords + accounting.outputGigawords}
                    </TableCell>
                    <TableCell className="font-medium text-purple-600 dark:text-purple-400">
                      {formatBytes(accounting.totalBytes)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Network Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
                <Network className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-medium">Network Details</h3>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-gray-500">Framed IP</TableCell>
                    <TableCell className="font-mono text-sm">{accounting.framedIpAddress}</TableCell>
                    <TableCell className="font-medium text-gray-500">Rate Limit</TableCell>
                    <TableCell className="font-mono text-sm">{accounting.mikrotikRateLimit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-gray-500">Called Station</TableCell>
                    <TableCell className="font-mono text-sm">{accounting.calledStationId}</TableCell>
                    <TableCell className="font-medium text-gray-500">Calling Station</TableCell>
                    <TableCell className="font-mono text-sm">{accounting.callingStationId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-gray-500">NAS IP</TableCell>
                    <TableCell className="font-mono text-sm">{accounting.nasIpAddress}</TableCell>
                    <TableCell className="font-medium text-gray-500">NAS Identifier</TableCell>
                    <TableCell className="font-mono text-sm">{accounting.nasIdentifier}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-gray-500">NAS Port</TableCell>
                    <TableCell className="font-mono text-sm">{accounting.nasPort}</TableCell>
                    <TableCell className="font-medium text-gray-500">NAS Port Type</TableCell>
                    <TableCell className="font-mono text-sm">{accounting.nasPortType}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-gray-500">Service Type</TableCell>
                    <TableCell className="font-mono text-sm">{accounting.serviceType}</TableCell>
                    <TableCell className="font-medium text-gray-500">Framed Protocol</TableCell>
                    <TableCell className="font-mono text-sm">{accounting.framedProtocol}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 