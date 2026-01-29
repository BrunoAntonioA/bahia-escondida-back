import { Body, Controller, Post } from '@nestjs/common';
import { PrinterService } from 'src/services/printer/printer/printer.service';

@Controller('printer')
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {
    }

   @Post()
     async testingPrint(@Body() body) {
       console.log('Received testing print request: ', body);
       return await this.printerService.print();
     }
}
