// Patch cordova-plugin-bluetooth-serial (0.4.7) setelah npm install.
// Dijalankan otomatis via package.json "postinstall", supaya cap sync
// menyalin Java yang SUDAH dipatch (bukan versi asli yang bisa crash).
// Patch: (1) ConnectThread NPE guard, (2) write() null guard, (3) WRITE null guard.
// Idempotent: kalau sudah dipatch, tidak diubah lagi.
const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '..', 'node_modules', 'cordova-plugin-bluetooth-serial', 'src', 'android', 'com', 'megster', 'cordova');

function patch(file, oldText, newText, label) {
  const fp = path.join(base, file);
  if (!fs.existsSync(fp)) { console.log('[patch-bt] lewati (tidak ada): ' + file); return; }
  let t = fs.readFileSync(fp, 'utf8');
  if (t.includes(newText)) { console.log('[patch-bt] sudah dipatch: ' + label); return; }
  if (!t.includes(oldText)) { console.log('[patch-bt] POLA TIDAK KETEMU: ' + label); return; }
  t = t.replace(oldText, newText);
  fs.writeFileSync(fp, t);
  console.log('[patch-bt] diterapkan: ' + label);
}

// 1) ConnectThread.run: guard mmSocket null + tangkap Throwable (bukan cuma IOException)
patch('BluetoothSerialService.java',
`            // Make a connection to the BluetoothSocket
            try {
                // This is a blocking call and will only return on a successful connection or an exception
                Log.i(TAG,"Connecting to socket...");
                mmSocket.connect();
                Log.i(TAG,"Connected");
            } catch (IOException e) {`,
`            // Make a connection to the BluetoothSocket
            if (mmSocket == null) {
                Log.e(TAG, "ConnectThread: socket null, batal sambung (bukan crash).");
                connectionFailed();
                return;
            }
            try {
                // This is a blocking call and will only return on a successful connection or an exception
                Log.i(TAG,"Connecting to socket...");
                mmSocket.connect();
                Log.i(TAG,"Connected");
            } catch (Throwable e) {`,
'ConnectThread NPE guard');

// 2) BluetoothSerialService.write: guard null
patch('BluetoothSerialService.java',
`    public void write(byte[] out) {
        // Create temporary object
        ConnectedThread r;
        // Synchronize a copy of the ConnectedThread
        synchronized (this) {
            if (mState != STATE_CONNECTED) return;
            r = mConnectedThread;
        }
        // Perform the write unsynchronized
        r.write(out);
    }`,
`    public void write(byte[] out) {
        if (out == null) { Log.e(TAG, "write: data null, batal (bukan crash)."); return; }
        // Create temporary object
        ConnectedThread r;
        // Synchronize a copy of the ConnectedThread
        synchronized (this) {
            if (mState != STATE_CONNECTED) return;
            r = mConnectedThread;
        }
        if (r == null) { Log.e(TAG, "write: thread null, batal (bukan crash)."); return; }
        // Perform the write unsynchronized
        r.write(out);
    }`,
'Service.write null guard');

// 3) ConnectedThread.write: guard buffer null
patch('BluetoothSerialService.java',
`        public void write(byte[] buffer) {
            try {
                mmOutStream.write(buffer);`,
`        public void write(byte[] buffer) {
            if (buffer == null) { Log.e(TAG, "ConnectedThread.write: buffer null, batal."); return; }
            try {
                mmOutStream.write(buffer);`,
'ConnectedThread.write null guard');

// 4) BluetoothSerial WRITE action: guard getArrayBuffer null
patch('BluetoothSerial.java',
`        } else if (action.equals(WRITE)) {

            byte[] data = args.getArrayBuffer(0);
            bluetoothSerialService.write(data);
            callbackContext.success();`,
`        } else if (action.equals(WRITE)) {

            byte[] data = null;
            try { data = args.getArrayBuffer(0); } catch (Exception e) { Log.e(TAG, "write: getArrayBuffer gagal", e); }
            if (data == null) { callbackContext.error("Tidak ada data untuk ditulis."); return true; }
            bluetoothSerialService.write(data);
            callbackContext.success();`,
'WRITE action null guard');

console.log('[patch-bt] selesai');
