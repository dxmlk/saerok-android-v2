const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const KOTLIN_VERSION = "2.1.21";
const NAVER_MAVEN = "https://repository.map.naver.com/archive/maven";
const KAKAO_MAVEN = "https://devrepo.kakao.com/nexus/content/groups/public/";

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content, "utf8");
  console.log(`[postprebuild-android] patched ${file}`);
}

function patchGradleProperties() {
  const file = "android/gradle.properties";
  let src = read(file);
  if (/^android\.kotlinVersion=/m.test(src)) {
    src = src.replace(/^android\.kotlinVersion=.*/m, `android.kotlinVersion=${KOTLIN_VERSION}`);
  } else {
    src += `\nandroid.kotlinVersion=${KOTLIN_VERSION}\n`;
  }
  write(file, src);
}

function patchRootBuildGradle() {
  const file = "android/build.gradle";
  let src = read(file);

  src = src.replace(
    /classpath\s+'org\.jetbrains\.kotlin:kotlin-gradle-plugin:[^']+'/,
    `classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}'`
  );

  if (!src.includes("https://repository.map.naver.com/archive/maven") || !src.includes("https://devrepo.kakao.com/nexus/content/groups/public/")) {
    src = src.replace(
      /allprojects\s*\{\s*repositories\s*\{([\s\S]*?)\n\s*\}\s*\}/,
      (match) => {
        let patched = match;
        if (!patched.includes(NAVER_MAVEN)) {
          patched = patched.replace(/mavenCentral\(\)/, `mavenCentral()\n    maven { url '${NAVER_MAVEN}' }`);
        }
        if (!patched.includes(KAKAO_MAVEN)) {
          patched = patched.replace(/mavenCentral\(\)(?:\n\s*maven \{ url '[^']+' \})?/, (m) => `${m}\n    maven { url '${KAKAO_MAVEN}' }`);
        }
        if (!patched.includes("https://www.jitpack.io")) {
          patched = patched.replace(/mavenCentral\(\)([\s\S]*?)(\n\s*\}\s*\})/, (m, repos, tail) => `mavenCentral()${repos}\n    maven { url 'https://www.jitpack.io' }${tail}`);
        }
        return patched;
      }
    );
  }

  // Safety: ensure all 3 repos exist even if regex branch above misses formatting.
  if (!src.includes(NAVER_MAVEN) || !src.includes(KAKAO_MAVEN) || !src.includes("https://www.jitpack.io")) {
    const repoBlockMatch = src.match(/allprojects\s*\{\s*repositories\s*\{[\s\S]*?\n\s*\}\s*\}/);
    if (repoBlockMatch) {
      let block = repoBlockMatch[0];
      if (!block.includes(NAVER_MAVEN)) block = block.replace(/repositories\s*\{/, `repositories {\n    maven { url '${NAVER_MAVEN}' }`);
      if (!block.includes(KAKAO_MAVEN)) block = block.replace(/repositories\s*\{/, `repositories {\n    maven { url '${KAKAO_MAVEN}' }`);
      if (!block.includes("https://www.jitpack.io")) block = block.replace(/repositories\s*\{/, `repositories {\n    maven { url 'https://www.jitpack.io' }`);
      src = src.replace(repoBlockMatch[0], block);
    }
  }

  write(file, src);
}

function patchAppBuildGradle() {
  const file = "android/app/build.gradle";
  let src = read(file);
  const placeholderLine = `            EXPO_PUBLIC_NAVER_MAP_CLIENT_ID: (System.getenv("EXPO_PUBLIC_NAVER_MAP_CLIENT_ID") ?: "")`;

  if (/manifestPlaceholders\s*=\s*\[[\s\S]*?]/m.test(src)) {
    if (!src.includes("EXPO_PUBLIC_NAVER_MAP_CLIENT_ID")) {
      src = src.replace(
        /manifestPlaceholders\s*=\s*\[/,
        `manifestPlaceholders = [\n${placeholderLine},`
      );
    }
  } else {
    src = src.replace(
      /versionName\s+"[^"]+"/,
      (m) => `${m}\n        manifestPlaceholders = [\n${placeholderLine}\n        ]`
    );
  }

  write(file, src);
}

function main() {
  patchGradleProperties();
  patchRootBuildGradle();
  patchAppBuildGradle();
  console.log("[postprebuild-android] done");
}

main();
