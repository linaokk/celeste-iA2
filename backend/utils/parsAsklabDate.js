export const parseAskLabDate = (dateString) => {
  // Format: "Mon Sep 22 15:06:58 CEST 2025"
  const parts = dateString.split(' ');
  const month = parts[1];
  const day = parts[2];
  const time = parts[3];
  const year = parts[5];
  
  // Mapping des mois
  const monthMap = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  // Construire un format ISO standard (on ignore CEST et on traite comme UTC+2)
  const isoString = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T${time}+02:00`;
  return new Date(isoString);
};