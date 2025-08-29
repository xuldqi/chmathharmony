@rem Copyright (c) 2024 Huawei Device Co., Ltd.
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem     http://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.

@echo off

@rem Expand all hvigorw.bat run path parameters, navigate to the project root directory
set DIR=%~dp0
cd /d %DIR%

@rem init HVIGOR_WRAPPER_HOME
if not defined HVIGOR_WRAPPER_HOME (
    for %%i in ("%USERPROFILE%") do (
        set "HVIGOR_WRAPPER_HOME=%%~si\.hvigor\wrapper"
    )
)

@rem Check hvigor directory
if not exist "%HVIGOR_WRAPPER_HOME%" (
    if exist "%HVIGOR_INST_PATH%\bin\hvigorw.js" (
        goto runhvigor
    )
    echo Error: Could not find hvigor wrapper
    exit /b 1
)

:runhvigor
set HVIGOR_WRAPPER_SCRIPT="%HVIGOR_WRAPPER_HOME%\node_modules\@ohos\hvigor\bin\hvigorw.js"

@rem Find node
if exist "%NODE_EXE%" (
    goto nodefound
)

where /q node.exe || (
    echo Error: Could not find node.js
    exit /b 1
)

set NODE_EXE=node.exe

:nodefound

@rem Run hvigor
"%NODE_EXE%" "%HVIGOR_WRAPPER_SCRIPT%" %*