import { cn, exportToCSV } from '@/lib/utils';

describe('Utils', () => {
    describe('cn (className merger)', () => {
        it('merges class names correctly', () => {
            expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
        });

        it('handles conditional classes', () => {
            expect(cn('px-2', false && 'py-1', 'text-red-500')).toBe('px-2 text-red-500');
        });

        it('handles tailwind conflicts', () => {
            expect(cn('px-2', 'px-4')).toBe('px-4');
        });
    });

    describe('exportToCSV', () => {
        let createElementSpy: jest.SpyInstance;
        let appendChildSpy: jest.SpyInstance;
        let removeChildSpy: jest.SpyInstance;
        let clickSpy: jest.Mock;

        beforeEach(() => {
            clickSpy = jest.fn();
            const mockLink = {
                setAttribute: jest.fn(),
                style: {},
                click: clickSpy,
            };

            createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
            appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
            removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();

            // Mock URL.createObjectURL
            global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        });

        afterEach(() => {
            createElementSpy.mockRestore();
            appendChildSpy.mockRestore();
            removeChildSpy.mockRestore();
        });

        it('exports data to CSV', () => {
            const data = [
                { name: 'John', age: 30 },
                { name: 'Jane', age: 25 },
            ];

            exportToCSV(data, 'test');

            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(clickSpy).toHaveBeenCalled();
        });

        it('handles empty data', () => {
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

            exportToCSV([], 'test');

            expect(alertSpy).toHaveBeenCalledWith('No data to export');
            alertSpy.mockRestore();
        });
    });
});
