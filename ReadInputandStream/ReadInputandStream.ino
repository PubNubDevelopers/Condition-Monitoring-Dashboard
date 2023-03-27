/* 
  Example: AnalogInput and Stream to PubNub
  This example shows how to read from analog input modules and stream the data over the internet. 
  This example works with all P1000 Series:
   - Analog input modules such as P1-04ADL-1, P1-04ADL-2,etc.
   - Analog combo modules such as P1-4ADL2DAL-1, P1-4ADL2DAL-2 etc.  
  This example will use a P1-04ADL-2 module in slot 1. 
  Analog input values are streamed to PubNub
  P1AM-ETH is required.
   _____  _____  _____ 
  |  P  ||  P  ||  S  |
  |  1  ||  1  ||  L  |
  |  A  ||  A  ||  O  |
  |  M  ||  M  ||  T  |
  |  -  ||  -  ||     |
  |  E  ||  1  ||  0  |
  |  T  ||  0  ||  1  |
  |  H  ||  0  ||     |
   ¯¯¯¯¯  ¯¯¯¯¯  ¯¯¯¯¯ 
*/

#include <P1AM.h>
#include <Ethernet.h>
#include <PubNub.h>

byte mac[] = { 0x60, 0x52, 0xD0, 0x07, 0x43, 0xD4 };

int channelRead1, channelRead2, channelRead3, channelRead4;
int channelLast1, channelLast2, channelLast3, channelLast4;

void setup(){ // the setup routine runs once:

  Serial.begin(115200);  //initialize serial communication at 115200 bits per second 
  while (!P1.init()){ 
    ; //Wait for Modules to Sign on   
  }
  while (!Ethernet.begin(mac)) {
    Serial.println("Ethernet setup error");
    delay(1000);
  }
  Serial.println(Ethernet.localIP());
  PubNub.set_uuid("monitoring_1");
  PubNub.begin("pub-c-a2daf68e-5588-4854-ba05-3f84a92d0d09", "sub-c-fec9355f-951f-48bb-811f-c573dd48e003");
}

void loop(){  // the loop routine runs over and over again forever:
  Ethernet.maintain();
  EthernetClient *client;

  // Get the readings from the 4 analog inputs 
  channelRead1 = P1.readAnalog(1, 1);
  channelRead2 = P1.readAnalog(1, 2);
  channelRead3 = P1.readAnalog(1, 3);
  channelRead4 = P1.readAnalog(1, 4);

  //Publish to PubNub the absolute value of the difference from the last 2 readings (the vibration)
  char msg[120];
  sprintf(msg, "{\"channel1\":%d,\"channel2\":%d,\"channel3\":%d,\"channel4\":%d}", abs(channelLast1-channelRead1), abs(channelLast2-channelRead2), abs(channelLast3-channelRead3), abs(channelLast4-channelRead4));
  if (channelLast1 > 0) { // Skip first publish
    client = PubNub.publish("monitoringchannel", msg);
    if (!client) {
        Serial.println("publishing error");
        delay(1000);
        return;
    }
    while (client->connected()) {
        while (client->connected() && !client->available());
        char c = client->read();
        Serial.print(c);
    }
    Serial.println();
    client->stop();
  }

  //Remember last reading for next reading
  channelLast1 = channelRead1;
  channelLast2 = channelRead2;
  channelLast3 = channelRead3;
  channelLast4 = channelRead4;
  
  Serial.println(msg);
  delay(500);
}
