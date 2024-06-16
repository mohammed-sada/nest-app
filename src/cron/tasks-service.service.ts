import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    // @Cron('45 * * * * *')
    @Cron(CronExpression.EVERY_30_SECONDS)
    handleCron() {
        this.logger.debug('Called every 30 seconds');
    }

    @Interval(10000)
    handleInterval() {
        this.logger.debug('Called every 10 seconds');
    }

    @Timeout(5000)
    handleTimeout() {
        this.logger.debug('Called once after 5 seconds');
    }

    @Cron('40 * * * * *', {
        name: 'notifications',
    })
    triggerNotifications() {
        this.logger.debug('Called on the 40 second');
    }
}

//? You can access and control a cron job after it's been declared, or dynamically create a cron job (where its cron pattern is defined at runtime) with the Dynamic API. To access a declarative cron job via the API, you must associate the job with a name by passing the name property in an optional options object as the second argument of the decorator.
// @Cron('* * 0 * * *', {
//     name: 'notifications',
//     timeZone: 'Europe/Paris',
//   })
//   triggerNotifications() {}


//? If you want to control your declarative interval from outside the declaring class via the Dynamic API, associate the interval with a name using the following construction:
// @Interval('notifications', 2500)
// handleInterval() {}


//? If you want to control your declarative timeout from outside the declaring class via the Dynamic API, associate the timeout with a name using the following construction:
// @Timeout('notifications', 2500)
// handleTimeout() {}