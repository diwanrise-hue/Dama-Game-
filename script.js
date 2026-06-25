<script>
    const board = document.getElementById('board');
    let selectedPiece = null; // لتخزين القطعة التي تم تحديدها حالياً

    // 1. بناء اللوحة وتوزيع القطع مع حفظ إحداثيات كل مربع
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
            
            // حفظ الصف والعمود داخل المربع كمستند بيانات (Dataset) لنسهل قراءتها عند الضغط
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            if (r === 1 || r === 2) {
                cell.appendChild(createPiece('white'));
            } else if (r === 5 || r === 6) {
                cell.appendChild(createPiece('black'));
            }
            board.appendChild(cell);
        }
    }

    function createPiece(color) {
        const piece = document.createElement('div');
        piece.className = 'piece ' + color;
        return piece;
    }

    // 2. التحكم بالتحديد والتحريك عند الضغط على اللوحة
    board.addEventListener('click', (e) => {
        const target = e.target;

        // أ. إذا ضغط اللاعب على قطعة: يتم تحديدها
        if (target.classList.contains('piece')) {
            if (selectedPiece) {
                selectedPiece.classList.remove('selected'); // إزالة التحديد عن القطعة السابقة
            }
            selectedPiece = target;
            selectedPiece.classList.add('selected'); // تطبيق التأثير الأصفر من الـ CSS
            return;
        }

        // ب. إذا ضغط اللاعب على مربع فارغ وكان قد حدد قطعة مسبقاً
        if (selectedPiece && target.classList.contains('cell') && !target.hasChildNodes()) {
            const fromCell = selectedPiece.parentElement;
            
            // جلب إحداثيات المربع الحالي والمربع المستهدف
            const fromRow = parseInt(fromCell.dataset.row);
            const fromCol = parseInt(fromCell.dataset.col);
            const toRow = parseInt(target.dataset.row);
            const toCol = parseInt(target.dataset.col);

            const rowDiff = toRow - fromRow;
            const colDiff = toCol - fromCol;
            const isWhite = selectedPiece.classList.contains('white');

            let isValidMove = false;

            // قواعد الحركة العادية في الدامة التركية (خطوة واحدة فقط: للأمام أو اليمين أو اليسار - لا يوجد حركات مائلة)
            if ((Math.abs(rowDiff) === 1 && colDiff === 0) || (rowDiff === 0 && Math.abs(colDiff) === 1)) {
                // منع القطع العادية من الرجوع للخلف
                if (isWhite && rowDiff >= 0) isValidMove = true;  // الأبيض يتحرك لأسفل اللوحة فقط
                if (!isWhite && rowDiff <= 0) isValidMove = true;  // الأسود يتحرك لأعلى اللوحة فقط
            }

            // إذا كانت الحركة صحيحة، يتم نقل القطعة للمربع الجديد
            if (isValidMove) {
                target.appendChild(selectedPiece);
                selectedPiece.classList.remove('selected'); // إلغاء التحديد بعد النقل
                selectedPiece = null;
            }
        }
    });
</script>
