 document.getElementById('whatsappForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const message = `Name: ${formData.get('name')}\nEmail: ${formData.get('email')}\nPhone: ${formData.get('phone')}\nAddress: ${formData.get('address')}\nMessage: ${formData.get('message')}`;
            const whatsappUrl = `https://wa.me/6285773009666?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
// Additional WhatsApp payment button handler
        document.getElementById('whatsappPay').addEventListener('click', (e) => {
            e.preventDefault();
            const message = "Saya ingin melakukan pembayaran via WhatsApp";
            const whatsappUrl = `https://wa.me/6285773009666?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
