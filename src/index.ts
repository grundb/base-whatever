class Converter {
  // All UTF-8 chars
  charArray: string[];
  valueMap: {[char: string]: number};
  
  constructor(digits: string) {
    if (![...digits].every(d => typeof(d) === 'string') || [...digits].length < 1) {
      throw new Error("invalid number system")
    }
    this.charArray = [...digits];
    this.valueMap = {};
    this.charArray.forEach((c: string, i: number) => {
      this.valueMap[c] = i;
    });
  }

  get base(): number {
    return this.charArray.length;
  }

  encode(n: number) {
    const resultingDigits = [];
    if (this.base === 1) {
      for (let i = 0; i < n; i++) {
        resultingDigits.push(0);
      }
    } else {
      while (n >= this.base) {
        const d = n % this.base; 
        resultingDigits.push(d);
        n = Math.floor(n / this.base);
      }
      resultingDigits.push(n);
    }
    return resultingDigits.map(d => this.charArray[d]).reverse().join('');
  } 

  decode(s: string) {
    const charsInS = [...s] // use UTF-8
    let res: number;
    if (this.base === 1) {
      const theChar = this.charArray[0]; 
      if (!charsInS.every(d => d === theChar)) {
        throw new Error("invalid string");
      }
      res = charsInS.length;
    } else {
      res = 0;
      let exp = 0;
      const reversedDigits = charsInS.reverse();
      for (const c of reversedDigits) {
        if (typeof(this.valueMap[c]) !== 'number') {
          throw new Error("invalid string");
        }
        res += this.valueMap[c] * Math.pow(this.base, exp);
        exp++; 
      } 
    }
    return res; 
  }
}

export default Converter;