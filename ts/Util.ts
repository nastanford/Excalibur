module ex.Util {
   export function base64Encode(inputStr: string) {
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var outputStr = "";
      var i = 0;

      while (i < inputStr.length) {
         //all three "& 0xff" added below are there to fix a known bug 
         //with bytes returned by xhr.responseText
         var byte1 = inputStr.charCodeAt(i++) & 0xff;
         var byte2 = inputStr.charCodeAt(i++) & 0xff;
         var byte3 = inputStr.charCodeAt(i++) & 0xff;

         var enc1 = byte1 >> 2;
         var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);

         var enc3, enc4;
         if (isNaN(byte2)) {
            enc3 = enc4 = 64;
         }
         else {
            enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
            if (isNaN(byte3)) {
               enc4 = 64;
            }
            else {
               enc4 = byte3 & 63;
            }
         }

         outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
      }

      return outputStr;
   }

   export function clamp(val, min, max) {
      return val < min ? min : (val > max ? max : val);
   }

   // Dynamic resizing
   export class Collection<T> {
      public static DefaultSize = 200;
      private internalArray: T[] = null;
      private endPointer: number = 0;


      constructor(initialSize?: number) {
         var size = initialSize || Collection.DefaultSize;
         this.internalArray = new Array<T>(size);
      } 

      private resize() {
         var newSize = this.internalArray.length * 2;
         var newArray = new Array<T>(newSize);
         var count = this.count();
         for (var i = 0; i < count; i++) {
            newArray[i] = this.internalArray[i];
         }

         delete this.internalArray;
         this.internalArray = newArray;
      }

      public push(element: T): T {
         if (this.endPointer === this.internalArray.length) {
            this.resize();
         }
         return this.internalArray[this.endPointer++] = element;
      }

      public pop(): T {
         this.endPointer = this.endPointer - 1 < 0 ? 0 : this.endPointer - 1;
         return this.internalArray[this.endPointer];
      }

      public count(): number {
         return this.endPointer;
      }

      public clear() {
         this.endPointer = 0;
      }

      public internalSize(): number {
         return this.internalArray.length;   
      }

      public elementAt(index: number): T {
         if (index >= this.count()) {
            return;
         }
         return this.internalArray[index];
      }

      public insert(index: number, value: T): T {
         if (index >= this.count()) {
            this.resize();
         }
         return this.internalArray[index] = value;
      }

      public remove(index: number): T {
         var count = this.count();
         // O(n) Shift 
         var removed = this.internalArray[index];
         for (var i = index; i < count; i++) {
            this.internalArray[i] = this.internalArray[i + 1];
         }
         this.endPointer--;
         return removed;
      }

      public removeElement(element: T) {
         var index = this.internalArray.indexOf(element);
         this.remove(index);
      }

      public toArray(): T[] {
         return this.internalArray.slice(0, this.endPointer);
      }

      public forEach(func: (element: T, index: number) => any) {
         var count = this.count();
         for (var i = 0; i < count; i++) {
            func.call(this, this.internalArray[i], i);
         }
      }

      public map(func: (element: T, index: number) => any) {
         var count = this.count();
         for (var i = 0; i < count; i++) {
            this.internalArray[i] = func.call(this, this.internalArray[i], i);
         }
      }
   }
}