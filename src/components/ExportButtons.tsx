import { Button } from '@/components/ui/button';
import { Download, FileText, File } from 'lucide-react';
import { RetrospectiveSession } from '@/types/retrospective';
import { exportToPDF, exportToMarkdown, exportToTxt } from '@/lib/export-utils';

interface ExportButtonsProps {
  session: RetrospectiveSession;
  summary: string;
  actionItems: string[];
}

export default function ExportButtons({ session, summary, actionItems }: ExportButtonsProps) {
  const handleExportPDF = () => exportToPDF(session, summary, actionItems);
  const handleExportMD = () => exportToMarkdown(session, summary, actionItems);
  const handleExportTXT = () => exportToTxt(session, summary, actionItems);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleExportPDF} className="flex items-center gap-2">
        <File className="w-4 h-4" />
        Export PDF
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportMD} className="flex items-center gap-2">
        <Download className="w-4 h-4" />
        Export Markdown
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportTXT} className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Export TXT
      </Button>
    </div>
  );
}
