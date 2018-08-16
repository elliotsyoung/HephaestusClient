# from servosix import ServoSix
# import sys
# ss = ServoSix()
#
# try:
#     while True:
#         message_from_node = sys.stdin.readline()
#         parsed_message = message_from_node.split(" ")
#         servo = int(parsed_message[0])
#         angle = int(parsed_message[1])
#         ss.set_servo(servo, angle)
#         print("turning head")
#         print(servo)
#         print(angle)
#         sys.stdout.flush()
# finally:
#     print("End of Python process, cleaning up...")
#     ss.cleanup()
#
from servosix import ServoSix
import sys
ss = ServoSix()

servo = 1
angle = 170
ss.set_servo(servo, angle)
print("turning head")
print(servo)
print(angle)
sys.stdout.flush()

print("End of Python process, cleaning up...")
ss.cleanup()
