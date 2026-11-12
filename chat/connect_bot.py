"""Tayyor handlerni mavjud shop2 botiga ulaydi; asl faylni zaxiralaydi."""
from pathlib import Path
import ast
import shutil
from datetime import datetime

source = Path(__file__).resolve().parent
target = source.parent / "shop2"
bot_file = target / "bot.py"
text = bot_file.read_text(encoding="utf-8-sig")
marker = "# NAFIS website order bridge"
addition = (
    marker + "\n"
    "from nafis_site_orders import register_site_orders\n"
    "register_site_orders(dp, ADMIN_IDS)\n\n\n"
)
if marker not in text:
    if "async def main():" not in text:
        raise SystemExit("main funksiyasi topilmadi; bot o'zgartirilmadi.")
    updated = text.replace("async def main():", addition + "async def main():", 1)
    ast.parse(updated)
    backup = bot_file.with_name("bot.py.backup-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
    shutil.copy2(bot_file, backup)
    shutil.copy2(source / "nafis_site_orders.py", target / "nafis_site_orders.py")
    bot_file.write_text(updated, encoding="utf-8")
    print("Bot handler ulandi; asl bot.py zaxiralandi.")
else:
    shutil.copy2(source / "nafis_site_orders.py", target / "nafis_site_orders.py")
    print("Handler yangilandi.")
ast.parse(bot_file.read_text(encoding="utf-8-sig"))
print("Python sintaksisi tekshirildi. O'zgarish ishlashi uchun botni qayta ishga tushiring.")
