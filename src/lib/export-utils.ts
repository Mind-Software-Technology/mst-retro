import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RetrospectiveSession, THEMES } from '@/types/retrospective';

export function exportToPDF(session: RetrospectiveSession, summary: string, actionItems: string[]) {
  const doc = new jsPDF();
  const theme = THEMES[session.theme!];

  // Title
  doc.setFontSize(20);
  doc.text(`Sprint Retrospective: ${session.sprintName}`, 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Team: ${session.teamName || 'N/A'}`, 14, 30);
  doc.text(`Date: ${session.date}`, 14, 36);
  doc.text(`Theme: ${theme.name}`, 14, 42);

  // Summary
  doc.setFontSize(14);
  doc.text('Summary', 14, 52);
  doc.setFontSize(11);
  const splitSummary = doc.splitTextToSize(summary, 180);
  doc.text(splitSummary, 14, 58);

  // Action Items
  let currentY = 58 + (splitSummary.length * 6) + 4;
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
  const tableData = session.feedbacks.map(f => [
    f.isAnonymous ? 'Anonymous' : f.authorName,
    f.category1,
    f.category2,
    f.category3
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Participant', theme.categories[0].name, theme.categories[1].name, theme.categories[2].name]],
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

  md += `## Feedback\n\n`;
  md += `| Participant | ${theme.categories[0].name} | ${theme.categories[1].name} | ${theme.categories[2].name} |\n`;
  md += `|---|---|---|---|\n`;
  
  session.feedbacks.forEach(f => {
    const name = f.isAnonymous ? 'Anonymous' : f.authorName;
    md += `| ${name} | ${f.category1.replace(/\n/g, '<br>')} | ${f.category2.replace(/\n/g, '<br>')} | ${f.category3.replace(/\n/g, '<br>')} |\n`;
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

  txt += `[ FEEDBACK ]\n`;
  session.feedbacks.forEach(f => {
    txt += `----------------------------------------------\n`;
    txt += `Participant: ${f.isAnonymous ? 'Anonymous' : f.authorName}\n`;
    txt += `${theme.categories[0].name}:\n${f.category1 || '-'}\n\n`;
    txt += `${theme.categories[1].name}:\n${f.category2 || '-'}\n\n`;
    txt += `${theme.categories[2].name}:\n${f.category3 || '-'}\n`;
  });
  txt += `----------------------------------------------\n`;

  const blob = new Blob([txt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Retro_${session.sprintName.replace(/\s+/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
