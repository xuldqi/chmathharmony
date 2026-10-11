/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');

function resolveHvigorScript() {
    const candidates = [
        process.env.HVIGORW_PATH,
        '/Applications/DevEco-Studio.app/Contents/tools/hvigor/bin/hvigorw.js'
    ].filter(Boolean);

    for (const file of candidates) {
        if (fs.existsSync(file)) {
            return file;
        }
    }

    return undefined;
}

function main() {
    const hvigorScript = resolveHvigorScript();
    if (!hvigorScript) {
        console.error('Cannot find DevEco hvigorw.js. Set HVIGORW_PATH or install DevEco Studio.');
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const result = spawnSync(process.execPath, [hvigorScript, ...args], {
        stdio: 'inherit',
        env: process.env,
        cwd: process.cwd()
    });

    if (result.error) {
        console.error('Failed to execute hvigor:', result.error.message);
        process.exit(1);
    }

    process.exit(result.status ?? 1);
}

if (require.main === module) {
    main();
}
