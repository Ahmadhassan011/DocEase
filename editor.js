document.addEventListener('DOMContentLoaded', () => {
    const newDocBtn = document.getElementById('newDocBtn');
    const saveDocBtn = document.getElementById('saveDocBtn');
    const deleteDocBtn = document.getElementById('deleteDocBtn');
    const openDocBtn = document.getElementById('openDocBtn');
    const printDocBtn = document.getElementById('printDocBtn');
    const savePdfBtn = document.getElementById('savePdfBtn');
    const saveDocxBtn = document.getElementById('saveDocxBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const docList = document.getElementById('docList');

    let documents = JSON.parse(localStorage.getItem('documents')) || [];
    let currentDocId = null;

    const Size = Quill.import('attributors/style/size');
    Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];
    Quill.register(Size, true);

    const quill = new Quill('#editor-container', {
        modules: {
            toolbar: '#toolbar'
        },
        theme: 'snow'
        
    });

    const renderDocList = () => {
        docList.innerHTML = '';
        documents.forEach((doc, index) => {
            const li = document.createElement('li');
            li.textContent = doc.title;
            li.addEventListener('click', () => loadDocument(index));
            docList.appendChild(li);
        });
    };

    const loadDocument = (index) => {
        currentDocId = index;
        quill.setContents(documents[index].content);
    };

    const saveDocument = () => {
        const content = quill.getContents();
        if (currentDocId !== null) {
            documents[currentDocId].content = content;
        } else {
            const title = prompt('Enter document title:');
            if (title) {
                documents.push({ title, content });
            }
        }
        localStorage.setItem('documents', JSON.stringify(documents));
        renderDocList();
    };

    const deleteDocument = () => {
        if (currentDocId !== null) {
            documents.splice(currentDocId, 1);
            localStorage.setItem('documents', JSON.stringify(documents));
            quill.setContents([]);
            currentDocId = null;
            renderDocList();
        }
    };

    const openDocument = () => {
        const title = prompt('Enter document title to open:');
        const doc = documents.find(doc => doc.title === title);
        if (doc) {
            currentDocId = documents.indexOf(doc);
            quill.setContents(doc.content);
        } else {
            alert('Document not found');
        }
    };

    const printDocument = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Print Document</title>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<div>' + quill.root.innerHTML + '</div>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const saveAsPdf = () => {
        const element = document.createElement('div');
        element.innerHTML = quill.root.innerHTML;
        html2pdf().from(element).save('document.pdf');
    };

    const saveAsDocx = () => {
        const doc = new docx.Document();
        const content = quill.getContents();
        const paragraphs = content.ops.map(op => new docx.Paragraph(op.insert));
        doc.addSection({ children: paragraphs });
        docx.Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'document.docx');
        });
    };

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    newDocBtn.addEventListener('click', () => {
        currentDocId = null;
        quill.setContents([]);
    });

    saveDocBtn.addEventListener('click', saveDocument);
    deleteDocBtn.addEventListener('click', deleteDocument);
    openDocBtn.addEventListener('click', openDocument);
    printDocBtn.addEventListener('click', printDocument);
    savePdfBtn.addEventListener('click', saveAsPdf);
    saveDocxBtn.addEventListener('click', saveAsDocx);

    renderDocList();
});