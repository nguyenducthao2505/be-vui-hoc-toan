#!/usr/bin/env bash
# Chạy sau "npx cap add android": gắn biểu tượng, màn hình chờ, quyền micro, khoá ký cố định, số phiên bản.
set -e
# Tăng thời gian chờ tải Gradle (mạng máy chủ đôi khi chậm)
W=android/gradle/wrapper/gradle-wrapper.properties
if grep -q '^networkTimeout' $W; then sed -i 's/^networkTimeout=.*/networkTimeout=120000/' $W; else echo 'networkTimeout=120000' >> $W; fi
RES=android/app/src/main/res
for d in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  mkdir -p $RES/mipmap-$d
  cp android-icon-$d.png    $RES/mipmap-$d/ic_launcher.png
  cp android-icon-$d.png    $RES/mipmap-$d/ic_launcher_round.png
  cp android-icon-$d-fg.png $RES/mipmap-$d/ic_launcher_foreground.png
done
cat > $RES/values/ic_launcher_background.xml <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<resources><color name="ic_launcher_background">#F49AC1</color></resources>
XML

# Màn hình chờ: nền hồng + biểu tượng ở giữa, đúng kích thước từng tệp
pip install --quiet pillow
python3 - <<'PY'
import glob
from PIL import Image
icon = Image.open('icon-512.png').convert('RGBA')
for f in glob.glob('android/app/src/main/res/drawable*/splash.png'):
    w, h = Image.open(f).size
    bg = Image.new('RGBA', (w, h), '#ffd6e8')
    s = int(min(w, h) * 0.4)
    ic = icon.resize((s, s))
    bg.paste(ic, ((w - s) // 2, (h - s) // 2), ic)
    bg.convert('RGB').save(f)
    print('splash', f, w, h)
PY

# Quyền micro + khai báo dịch vụ giọng nói (Android 11 trở lên cần <queries>)
M=android/app/src/main/AndroidManifest.xml
python3 - "$M" <<'PY'
import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
add = '''    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <queries>
        <intent><action android:name="android.speech.RecognitionService" /></intent>
        <intent><action android:name="android.intent.action.TTS_SERVICE" /></intent>
    </queries>
'''
if 'android.speech.RecognitionService' not in s:
    s = s.replace('</manifest>', add + '</manifest>')
open(p, 'w', encoding='utf-8').write(s)
PY

# Ẩn thanh trạng thái cho toàn màn hình
S=$RES/values/styles.xml
sed -i 's#<style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">#&\n        <item name="android:windowFullscreen">true</item>#' $S

# Khoá ký cố định (để cài bản mới đè lên bản cũ) + số phiên bản theo lần build
N=${GITHUB_RUN_NUMBER:-1}
G=android/app/build.gradle
sed -i "s/versionCode 1$/versionCode $N/; s/versionName \"1.0\"/versionName \"1.$N\"/" $G
cat >> $G <<GRADLE

android {
    signingConfigs {
        debug {
            storeFile file("../../debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }
    }
}
GRADLE
echo "Android setup xong (phiên bản 1.$N)"
