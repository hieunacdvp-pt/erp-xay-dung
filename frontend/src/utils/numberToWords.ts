const defaultNumbers = ' hai ba bốn năm sáu bảy tám chín';
const chuHangDonVi = ('1 một' + defaultNumbers).split(' ');
const chuHangChuc = ('lẻ mười' + defaultNumbers).split(' ');
const chuHangTram = ('không một' + defaultNumbers).split(' ');

function convertBlockThree(number: string): string {
  let kq = '';
  const tram = parseInt(number[0]);
  const chuc = parseInt(number[1]);
  const donvi = parseInt(number[2]);
  
  kq += chuHangTram[tram] + ' trăm ';
  if (chuc === 0 && donvi !== 0) kq += 'lẻ ';
  if (chuc !== 0 && chuc !== 1) kq += chuHangChuc[chuc] + ' mươi ';
  if (chuc === 1) kq += 'mười ';
  
  switch (donvi) {
    case 1:
      if (chuc !== 0 && chuc !== 1) kq += 'mốt ';
      else kq += chuHangDonVi[donvi] + ' ';
      break;
    case 5:
      if (chuc !== 0) kq += 'lăm ';
      else kq += chuHangDonVi[donvi] + ' ';
      break;
    default:
      if (donvi !== 0) kq += chuHangDonVi[donvi] + ' ';
      break;
  }
  return kq;
}

export function numberToWordsVN(number: number): string {
  if (number === 0) return 'Không đồng';
  
  let str = Math.round(number).toString();
  let kq = '';
  const blocks = [];
  
  while (str.length > 0) {
    blocks.push(str.length >= 3 ? str.slice(str.length - 3) : str);
    str = str.slice(0, Math.max(0, str.length - 3));
  }
  
  const unit = ['', 'nghìn ', 'triệu ', 'tỷ ', 'nghìn tỷ ', 'triệu tỷ '];
  
  for (let i = blocks.length - 1; i >= 0; i--) {
    let block = blocks[i];
    while (block.length < 3 && i !== blocks.length - 1) block = '0' + block;
    if (block.length < 3 && i === blocks.length - 1) {
      if (block.length === 1) block = '00' + block;
      else if (block.length === 2) block = '0' + block;
    }
    
    if (block !== '000') {
      let blockWords = convertBlockThree(block);
      // Xóa chữ "không trăm lẻ" ở đầu nếu nó là block cao nhất
      if (i === blocks.length - 1) {
        blockWords = blockWords.replace(/^không trăm (lẻ )?/, '').trim() + ' ';
      }
      kq += blockWords + unit[i];
    }
  }
  
  kq = kq.trim().replace(/\s+/g, ' ') + ' đồng chẵn';
  return kq.charAt(0).toUpperCase() + kq.slice(1);
}
