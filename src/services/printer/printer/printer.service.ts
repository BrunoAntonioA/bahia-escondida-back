import { Injectable } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { exec } from 'child_process';
import { join } from 'path';

@Injectable()
export class PrinterService {
  print() {

    exec(
    `powershell -command "Start-Process notepad.exe -ArgumentList 'file.txt' -Verb Print"`,
    );

  }
}
