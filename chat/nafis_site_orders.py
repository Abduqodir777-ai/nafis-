"""NAFIS saytidan tayyorlangan buyurtma so'rovlarini adminlarga yetkazish.

Narxlar bu kanal orqali tasdiqlanmaydi. Asosiy Mini App buyurtma va
qoldiq hisoblash tizimi alohida ishlashda davom etadi.
"""
from aiogram import F
from aiogram.types import Message

PREFIX = "Assalomu alaykum! NAFIS saytidan buyurtma bermoqchiman."


def register_site_orders(dispatcher, admin_ids):
    @dispatcher.message(F.text.startswith(PREFIX))
    async def site_order(message: Message):
        text = (message.text or "").strip()
        if not message.from_user or message.chat.type != "private":
            return
        if len(text) > 3500:
            await message.answer("Buyurtma juda uzun. Iltimos, mahsulotlarni ikki buyurtmaga ajrating.")
            return
        required = ("Ism: ", "Telefon: ", "Olish usuli: ", "Taxminiy jami:")
        if any(field not in text for field in required):
            await message.answer("Iltimos, saytda ism, telefon va olish usulini to'ldirib, buyurtmani qayta nusxalang.")
            return
        user = message.from_user
        contact = f"@{user.username}" if user.username else str(user.id)
        header = (
            "NAFIS — SAYTDAN BUYURTMA SO'ROVI\n"
            f"Mijoz: {contact} | Telegram ID: {user.id}\n"
            "Narx, mavjudlik va yetkazib berishni mijoz bilan tasdiqlang.\n\n"
        )
        delivered = 0
        for admin_id in set(admin_ids):
            try:
                await message.bot.send_message(admin_id, header + text, parse_mode=None)
                delivered += 1
            except Exception:
                # Telefon/manzil yoki bot tokenini logga chiqarmang.
                continue
        if delivered:
            await message.answer(
                "Buyurtma so'rovingiz adminga yetkazildi. "
                "Narx, mavjudlik va yetkazib berish tasdiqlangach buyurtma yakunlanadi. "
                "Admin javobini kuting."
            )
        else:
            await message.answer(
                "Hozir buyurtmani adminga yetkazib bo'lmadi. "
                "Buyurtma qabul qilinmadi. Iltimos, keyinroq qayta yuboring."
            )
