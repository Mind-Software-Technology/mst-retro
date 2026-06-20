import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RetrospectiveSession, THEMES } from '@/types/retrospective';

export function exportToPDF(session: RetrospectiveSession, summary: string, actionItems: string[]) {
  const doc = new jsPDF();
  const theme = THEMES[session.theme!];

  // Company Header
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('MST (Mind Software Technology)', 14, 15);
  doc.line(14, 18, 196, 18); // Draw a line under the header

  // Title
  doc.setTextColor(0); // Reset to black
  doc.setFontSize(20);
  doc.text(`Sprint Retrospective: ${session.sprintName}`, 14, 28);
  
  doc.setFontSize(12);
  doc.text(`Team: ${session.teamName || 'N/A'}`, 14, 36);
  doc.text(`Date: ${session.date}`, 14, 42);
  doc.text(`Theme: ${theme.name}`, 14, 48);

  // Summary
  doc.setFontSize(14);
  doc.text('Summary', 14, 58);
  doc.setFontSize(11);
  const splitSummary = doc.splitTextToSize(summary, 180);
  doc.text(splitSummary, 14, 64);

  // Action Items
  let currentY = 64 + (splitSummary.length * 6) + 4;
  doc.setFontSize(14);
  doc.text('Action Items', 14, currentY);
  doc.setFontSize(11);
  currentY += 6;
  actionItems.forEach(item => {
    doc.text(`• ${item}`, 14, currentY);
    currentY += 6;
  });

  // Table
  currentY += 4;
  
  const tableData: any[] = [];
  theme.categories.forEach(cat => {
    const catFeedbacks = session.feedbacks.filter(f => f.categoryId === cat.id);
    if (catFeedbacks.length > 0) {
      // Add category header row
      tableData.push([{ content: `--- ${cat.name} ---`, colSpan: 2, styles: { fontStyle: 'bold', halign: 'center' } }]);
      catFeedbacks.forEach(f => {
        let text = f.content;
        if (f.notes && f.notes.length > 0) {
          text += '\n\nNotes:\n' + f.notes.map(n => `- ${n.authorName}: ${n.text}`).join('\n');
        }
        tableData.push([f.isAnonymous ? 'Anonymous' : f.authorName, text]);
      });
    }
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Participant', 'Feedback']],
    body: tableData,
  });

  doc.save(`Retro_${session.sprintName.replace(/\s+/g, '_')}.pdf`);
}

export function exportToMarkdown(session: RetrospectiveSession, summary: string, actionItems: string[]) {
  const theme = THEMES[session.theme!];
  let md = `# Sprint Retrospective: ${session.sprintName}\n\n`;
  md += `**Team:** ${session.teamName || 'N/A'}  \n`;
  md += `**Date:** ${session.date}  \n`;
  md += `**Theme:** ${theme.name}\n\n`;

  md += `## Summary\n${summary}\n\n`;

  md += `## Action Items\n`;
  actionItems.forEach(item => {
    md += `- ${item}\n`;
  });
  md += `\n`;

  md += `## Feedback Board\n\n`;
  
  theme.categories.forEach(cat => {
    md += `### ${cat.icon} ${cat.name}\n\n`;
    const catFeedbacks = session.feedbacks.filter(f => f.categoryId === cat.id);
    if (catFeedbacks.length === 0) {
      md += `*No feedback in this category*\n\n`;
    } else {
      catFeedbacks.forEach(f => {
        const name = f.isAnonymous ? 'Anonymous' : f.authorName;
        md += `- **${name}**: ${f.content.replace(/\n/g, ' ')}\n`;
        if (f.notes && f.notes.length > 0) {
          f.notes.forEach(n => {
            md += `  - *${n.authorName}*: ${n.text}\n`;
          });
        }
      });
      md += `\n`;
    }
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Retro_${session.sprintName.replace(/\s+/g, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToTxt(session: RetrospectiveSession, summary: string, actionItems: string[]) {
  const theme = THEMES[session.theme!];
  let txt = `Sprint Retrospective: ${session.sprintName}\n`;
  txt += `==============================================\n`;
  txt += `Team: ${session.teamName || 'N/A'}\n`;
  txt += `Date: ${session.date}\n`;
  txt += `Theme: ${theme.name}\n\n`;

  txt += `[ SUMMARY ]\n${summary}\n\n`;

  txt += `[ ACTION ITEMS ]\n`;
  actionItems.forEach(item => {
    txt += `- ${item}\n`;
  });
  txt += `\n`;

  txt += `[ FEEDBACK BOARD ]\n\n`;
  
  theme.categories.forEach(cat => {
    txt += `--- ${cat.name.toUpperCase()} ---\n`;
    const catFeedbacks = session.feedbacks.filter(f => f.categoryId === cat.id);
    if (catFeedbacks.length === 0) {
      txt += `(Empty)\n\n`;
    } else {
      catFeedbacks.forEach(f => {
        const name = f.isAnonymous ? 'Anonymous' : f.authorName;
        txt += `[${name}]: ${f.content}\n`;
        if (f.notes && f.notes.length > 0) {
          f.notes.forEach(n => {
            txt += `  -> Note by ${n.authorName}: ${n.text}\n`;
          });
        }
        txt += `\n`;
      });
    }
  });

  const blob = new Blob([txt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Retro_${session.sprintName.replace(/\s+/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
