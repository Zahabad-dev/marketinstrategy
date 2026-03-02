const { execSync } = require('child_process');

const envVars = {
  'DATABASE_URL': 'mysql://root:ypSkugjCaCdkjtDbUYDGdpFiVBxiGrvS@nozomi.proxy.rlwy.net:37955/railway',
  'JWT_SECRET': '32edafb6aabfb92c3b78da194d51a147739579db998579d15b6410f22f267763',
  'JWT_EXPIRES_IN': '7d',
  'NODE_ENV': 'production',
  'NEXT_PUBLIC_APP_URL': 'https://marketinstrategy.vercel.app',
  'MAX_UPLOAD_SIZE': '104857600'
};

console.log('🚀 Agregando variables de entorno a Vercel...\n');

for (const [name, value] of Object.entries(envVars)) {
  try {
    // Escribir valor a archivo temporal sin newline
    const fs = require('fs');
    const tempFile = `.temp_${name}.txt`;
    fs.writeFileSync(tempFile, value, { encoding: 'utf8', flag: 'w' });
    
    // Usar Get-Content con -Raw y .Trim() para eliminar cualquier whitespace
    const cmd = `powershell -Command "Get-Content ${tempFile} -Raw | ForEach-Object { $_.Trim() } | vercel env add ${name} production --force"`;
    
    execSync(cmd, { stdio: 'inherit' });
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempFile);
    
    console.log(`✅ ${name} agregada\n`);
  } catch (error) {
    console.error(`❌ Error agregando ${name}:`, error.message);
  }
}

console.log('\n✅ Todas las variables agregadas. Ejecuta: vercel --prod --yes');
